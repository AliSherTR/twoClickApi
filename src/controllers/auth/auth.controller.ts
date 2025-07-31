import { Request, Response, NextFunction } from "express";
import prisma from "../../db/database";
import { verifyGoogleToken } from "../../external-services/google-auth";
import jwt from "jsonwebtoken";
import { catchAsync } from "../../utils/catch-async";
import { AppError } from "../../utils/app-error";
import { registerXmppUser } from "../../utils/register-xmpp-user";
import { randomBytes } from "crypto";

export const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, token } = req.body;

    if (!email || !token) {
      res.status(400).json({
        message: "Email and Token are required",
      });
    }

    const verifiedAccount = await verifyGoogleToken(token);

    // find existing user
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      if (existingUser.email !== verifiedAccount.email) {
        res.json(400).json({
          message: "You are not allowed to visit this api",
        });
      }

      const payload = {
        id: existingUser.id,
        email: existingUser.email,
      };

      const authToken = jwt.sign(payload, process.env.JWT_SECRET as string);

      return res.status(200).json({
        status: 200,
        message: "Logged in successfully",
        data: {
          id: existingUser.id,
          xmppUserId: existingUser.xmppUserId,
          password: existingUser.xmppPassword,
          email: existingUser.email,
          token: authToken,
        },
      });
    }

    // create new user

    // return { id , xmppUserId , xmppPassword , jwttoken }
    const xmppPassword = randomBytes(32).toString("hex");
    const xmppEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
    const xmppUser = await registerXmppUser(xmppEmail, xmppPassword);

    if (xmppUser) {
      const newUser = await prisma.user.create({
        data: {
          email,
          xmppUserId: xmppEmail,
          xmppPassword,
          password: xmppPassword,
          loginType: "google",
          name: verifiedAccount.name,
        },
      });

      const payload = {
        id: newUser.id,
        email: newUser.email,
      };

      const authToken = jwt.sign(payload, process.env.JWT_SECRET as string);

      return res.status(200).json({
        status: 200,
        message: "Logged in successfully",
        data: {
          id: newUser.id,
          xmppUserId: newUser.xmppUserId,
          password: newUser.xmppPassword,
          email: newUser.email,
          token: authToken,
        },
      });
    }

    return next(new AppError("Invalid Google login", 401));
  }
);
