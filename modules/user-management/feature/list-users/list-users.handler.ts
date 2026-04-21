import { Request, Response } from "express";

import { NotFoundError } from "../../../../shared/errors";
import { catchErrors } from "../../../../shared/middleware";
import { GlimpseRepository } from "../../infrastructure/repository/glimpse.repository";
import { InteractionRepository } from "../../infrastructure/repository/interaction.repository";
import { UserRepository } from "../../infrastructure/repository/user.repository";
import { listUsersQueryValidator } from "./list-users.validator";

interface PaginatedCriteria {
  [key: string]: unknown;
  limit: number;
  skip: number;
}

const parseBirthDateRange = (ageRange: [number, number]) => {
  const [minAge, maxAge] = ageRange;
  const currentDate = new Date();

  const maxBirthDate = new Date(
    currentDate.getFullYear() - minAge,
    currentDate.getMonth(),
    currentDate.getDate(),
  );

  const minBirthDate = new Date(
    currentDate.getFullYear() - maxAge - 1,
    currentDate.getMonth(),
    currentDate.getDate(),
  );

  return { $gte: minBirthDate, $lte: maxBirthDate };
};

export const listUsersHandler = catchErrors(
  async (req: Request, res: Response) => {
    const query = listUsersQueryValidator.parse(req.query);
    const {
      userID,
      age_range = [18, 28],
      distance = 50000,
      limit = 10,
      page = 1,
    } = query;

    const user = await UserRepository.findById(userID);
    if (!user) {
      throw new NotFoundError("User");
    }

    const userInteractions =
      await InteractionRepository.findUserInteractions(userID);
    const likedUserIDs = (userInteractions || [])
      .filter(({ type }) => type === "like" || type === "match")
      .map(({ type, from, to }) =>
        type === "like" || String(from) === userID ? String(to) : String(from),
      );

    const criteria = {} as PaginatedCriteria;

    criteria._id = { $ne: userID };
    if (likedUserIDs.length > 0) {
      (criteria._id as { $ne: string; $nin?: string[] }).$nin = likedUserIDs;
    }

    criteria.orientation = { $eq: user.orientation };
    criteria.gender = { $ne: user.gender };
    criteria.dob = parseBirthDateRange(age_range as [number, number]);

    criteria.$or = [
      {
        "interests.coreActivities": {
          $in: user.interests?.coreActivities || [],
        },
      },
      {
        "interests.mediaConsumption": {
          $in: user.interests?.mediaConsumption || [],
        },
      },
      {
        "interests.lifestyle": {
          $in: user.interests?.lifestyle || [],
        },
      },
      {
        "interests.datingPreferences": {
          $in: user.interests?.datingPreferences || [],
        },
      },
    ];

    const userCoordinates = user.location?.coordinates || [0, 0];
    criteria.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [userCoordinates[0], userCoordinates[1]],
        },
        $maxDistance: distance * 1000,
      },
    };

    criteria.limit = limit;
    criteria.skip = (page - 1) * limit;

    const users = await UserRepository.getFilteredUsers(criteria);
    const filteredUserIDs = users.map(({ _id }) => String(_id));

    const glimpses =
      await GlimpseRepository.findGlimpsesByUserIDs(filteredUserIDs);
    const glimpsesByUserID = glimpses.reduce<Record<string, typeof glimpses>>(
      (
        accumulator: Record<string, typeof glimpses>,
        glimpse: (typeof glimpses)[number],
      ) => {
        const key = String(glimpse.userID);

        if (!accumulator[key]) {
          accumulator[key] = [];
        }

        accumulator[key].push(glimpse);
        return accumulator;
      },
      {},
    );

    const response = users.map((filteredUser) => {
      const userObject = filteredUser.toObject
        ? filteredUser.toObject()
        : filteredUser;

      return {
        ...userObject,
        glimpses: glimpsesByUserID[String(userObject._id)] || [],
      };
    });

    res.status(200).json(response);
  },
);
