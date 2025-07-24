import { Request, Response, NextFunction } from "express";
import prisma from "../../db/database";
import { verifyGoogleToken } from "../../external-services/google-auth";
import jwt from "jsonwebtoken";
import { catchAsync } from "../../utils/catch-async";
import { AppError } from "../../utils/app-error";

export const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return next(new AppError("Email and password are required", 400));
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const verifiedAccount = await verifyGoogleToken(password);

      if (verifiedAccount.email === existingUser.email) {
        const payload = {
          email: existingUser.email,
          name: existingUser.name,
          googleId: verifiedAccount.sub,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string);
        return res.status(200).json({
          status: "success",
          message: "Login successful",
          data: {
            user: {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
            },
            token,
          },
        });
      }
      return next(new AppError("Invalid Google token", 401));
    }

    const verifiedAccount = await verifyGoogleToken(password);
    if (verifiedAccount.email === email) {
      const newUser = await prisma.user.create({
        data: {
          email: verifiedAccount.email,
          name: verifiedAccount.name,
          loginType: "google",
          password: "",
        },
      });
      const payload = {
        email: newUser.email,
        name: newUser.name,
        googleId: verifiedAccount.sub,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET as string);
      return res.status(201).json({
        status: "success",
        message: "User created and logged in successfully",
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          },
          token,
        },
      });
    }

    return next(new AppError("Invalid Google token for email", 401));
  }
);
