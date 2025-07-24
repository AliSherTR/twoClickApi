import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { Prisma } from "../../generated/prisma";
import prisma from "../../db/database";
import { AppError } from "../../utils/app-error";

export const createSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    const { name } = req.body;

    if (!userId || !name) {
      throw new AppError("Invalid Data", 400);
    }

    const newSession = await prisma.session.create({
      data: {
        user: { connect: { id: userId } },
        name,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // expires in 24 hours
      },
    });

    res.status(201).json({
      status: 201,
      message: "Session Created Successfully",
      data: {
        newSession,
      },
    });
  }
);
