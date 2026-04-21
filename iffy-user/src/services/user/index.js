const { UserNotFound, PromptNotFound } = require("../../errors/custom-errors");
const { Producer } = require("../../message-bus/producer");
const { userRepository } = require("../../repositories");
const { interactionRepository } = require("../../repositories");
const { glimpseRepository } = require("../../repositories");

async function handleUserAuth(uid) {
  const user = await userRepository.findByUserID(uid);
  if (!user) {
    return await userRepository.create({ userID: uid });
  }

  return user;
}

const parseAgeRange = (ageRange) => {
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

  return {
    $gte: minBirthDate,
    $lte: maxBirthDate,
  };
};

async function getFilteredUsers(payload) {
  const {
    userID,
    age_range = [18, 28],
    distance = 50000,
    limit = 10,
    page = 1,
  } = payload;
  const criteria = {};

  const user = await userRepository.findById(userID);
  if (!user) {
    throw new UserNotFound();
  }
  const userInteractions =
    await interactionRepository.findUserInteractions(userID);

  let likedUserIDs = [];
  if (userInteractions && userInteractions.length > 0) {
    likedUserIDs = userInteractions
      .filter(({ type }) => type === "like" || type === "match")
      .map(({ type, from, to }) =>
        type === "like" || from.toString() === userID ? to : from,
      );
  }

  if (userID || likedUserIDs.length > 0) {
    criteria._id = {};
    if (userID) criteria._id.$ne = userID;
    if (likedUserIDs.length > 0) criteria._id.$nin = likedUserIDs;
  }

  criteria.orientation = { $eq: user.orientation };
  criteria.gender = { $ne: user.gender };

  const ageFilter = parseAgeRange(age_range);
  if (ageFilter) {
    criteria.dob = ageFilter;
  }

  criteria.$or = [
    { "interests.coreActivities": { $in: user.interests.coreActivities } },
    { "interests.mediaConsumption": { $in: user.interests.mediaConsumption } },
    { "interests.lifestyle": { $in: user.interests.lifestyle } },
    {
      "interests.datingPreferences": { $in: user.interests.datingPreferences },
    },
  ];

  criteria.location = {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [
          user.location.coordinates[0],
          user.location.coordinates[1],
        ],
      },
      $maxDistance: distance * 1000,
    },
  };

  criteria.limit = parseInt(limit);
  criteria.skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await userRepository.getFilteredUsers(criteria);
  const filteredUserIDs = users.map(({ _id }) => _id);

  const glimpses =
    await glimpseRepository.findGlimpsesByUserIDs(filteredUserIDs);
  const glimpsesByUserID = glimpses.reduce((accumulator, glimpse) => {
    const key = glimpse.userID.toString();
    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(glimpse);
    return accumulator;
  }, {});

  return users.map((filteredUser) => {
    const user = filteredUser.toObject ? filteredUser.toObject() : filteredUser;
    return {
      ...user,
      glimpses: glimpsesByUserID[user._id.toString()] || [],
    };
  });
}

async function getUser(req) {
  const { userID } = req.params;
  const { fields = "" } = req.query;

  const projection = fields.split(",").join(" ");

  const user = await userRepository.findById(userID, projection);
  if (!user) {
    throw new UserNotFound();
  }

  return user;
}

async function updateUserDetails(userID, details) {
  const user = await userRepository.findById(userID);

  if (!user) {
    throw new UserNotFound();
  }

  const payload = {
    ...details,
  };

  if (!user.isProfileComplete) {
    payload.isProfileComplete = true;
  }

  if (payload.persona) {
    const producer = new Producer(
      process.env.RABBIT_MQ_URL,
      process.env.RABBITMQ_TOPIC_EXCHANGE,
    );

    const message = {
      _id: user._id,
      name: user.name,
      persona: payload.persona,
    };

    producer.publish("user.profile.update", message);
  }

  const res = await userRepository.updateUserDetails(userID, payload);

  const response = {
    ...res,
    data: payload,
  };
  return response;
}

async function deleteUser(userID) {
  const user = await userRepository.findById(userID);
  if (!user) {
    throw new UserNotFound();
  }

  const producer = new Producer(
    process.env.RABBIT_MQ_URL,
    process.env.RABBITMQ_TOPIC_EXCHANGE,
  );

  const message = {
    _id: user._id,
  };

  producer.publish("user.profile.deleted", message);

  return await userRepository.deleteUser(userID);
}

async function updatePrompt(userID, promptID, prompts) {
  const user = await userRepository.findById(userID);
  if (!user) {
    throw new UserNotFound();
  }

  const prompt = await userRepository.findPromptById(userID, promptID);
  if (!prompt) {
    throw new PromptNotFound();
  }

  return await userRepository.updatePrompt(userID, promptID, prompts);
}

async function deletePrompt(userID, promptID) {
  const user = await userRepository.findById(userID);
  if (!user) {
    throw new UserNotFound();
  }

  const prompt = await userRepository.findPromptById(userID, promptID);
  if (!prompt) {
    throw new PromptNotFound();
  }

  return await userRepository.deletePrompt(userID, promptID);
}

async function addBulkPrompts(userID, prompts) {
  const user = await userRepository.findById(userID);

  if (!user) {
    throw new UserNotFound();
  }

  const res = await userRepository.addBulkPrompts(userID, prompts);
  return res;
}

async function getLikers(userID) {
  const interactions =
    await interactionRepository.findInteractionsOnUser(userID);
  return interactions;
}

module.exports = {
  handleUserAuth,
  updateUserDetails,
  getUser,
  getFilteredUsers,
  addBulkPrompts,
  updatePrompt,
  deletePrompt,
  getLikers,
  deleteUser,
};
