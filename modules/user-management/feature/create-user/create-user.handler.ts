import mongoose from "mongoose";
import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response } from "express";
import { createUserValidator } from "./create-user.validator";
import { UserRepository } from "../../infrastructure/repository/user.repository";
import { catchErrors } from "../../../../shared/middleware";

const createToken = (payload: {
  id: mongoose.Types.ObjectId;
  isProfileComplete: boolean;
}) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "24h";
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, process.env.JWT_SECRET as string, options);
};

export const createUserHandler = catchErrors(
  async (req: Request, res: Response) => {
    const body = createUserValidator.parse(req.body);

    const existingUser = await UserRepository.findByUID(body.uid);
    if (existingUser) {
      const token = createToken({
        id: existingUser._id,
        isProfileComplete: existingUser.isProfileComplete,
      });

      res.status(201).json(token);
      return;
    }

    const user = await UserRepository.create({
      uid: body.uid,
      email: body.email,
    });
    const token = createToken({
      id: user._id,
      isProfileComplete: user.isProfileComplete,
    });
    res.status(201).json(token);
  },
);
