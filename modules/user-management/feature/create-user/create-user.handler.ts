import { Request, Response } from "express";
import { createUserValidator } from "./create-user.validator";
import { UserRepository } from "../../infrastructure/repository/user.repository";
import { catchErrors } from "../../../../shared/middleware";

export const createUserHandler = catchErrors(
  async (req: Request, res: Response) => {
    const body = createUserValidator.parse(req.body);

    const existingUser = await UserRepository.findByUserID(body.uid);
    if (existingUser) {
      res.status(201).json(existingUser);
      return;
    }

    const user = await UserRepository.create({ userID: body.uid });
    res.status(201).json(user);
  },
);
