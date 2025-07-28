import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db/database";
import { AppError } from "../utils/app-error";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        xmppUserId: string;
        email: string;
        name: string | null;
        googleId: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        "No token provided. Please include a Bearer token in the Authorization header.",
        401
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError("Invalid token format.", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      email: string;
    };

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: {
        id: true,
        xmppUserId: true,
        email: true,
        name: true,
        loginType: true,
      },
    });

    if (!user) {
      throw new AppError("You are not authorized to visit this route.", 401);
    }

    // Attach user to request
    req.user = {
      id: user.id,
      xmppUserId: user.xmppUserId,
      email: user.email,
      name: user.name,
      googleId: "",
    };

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again.", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired. Please log in again.", 401));
    }
    next(error);
  }
};
