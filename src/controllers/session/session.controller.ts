import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import prisma from "../../db/database";
import { AppError } from "../../utils/app-error";

export const createSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const xmppUserId = req.user?.xmppUserId;

    const { name, size } = req.body;

    if (!xmppUserId || !name || !size) {
      throw new AppError("Invalid Data", 400);
    }

    const newSession = await prisma.session.create({
      data: {
        user: { connect: { xmppUserId } }, // <-- FIXED
        name,
        size,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
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

export const getAllSessions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const xmppUserId = req.user?.xmppUserId;

    const sessionsCreateByUser = await prisma.session.findMany({
      where: {
        userId: xmppUserId,
      },
    });

    if (!sessionsCreateByUser) {
      return res.status(404).json({
        status: "success",
        message: `No sessions created by ${req.user?.email}`,
        data: [],
      });
    }

    res.status(200).json({
      status: "success",
      message: "Sessions fetched successfully",
      data: sessionsCreateByUser,
    });
  }
);

export const getSessionById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const session = await prisma.session.findUnique({
      where: {
        id,
      },
    });

    if (!session) {
      return res.status(404).json({
        success: "false",
        message: "The requested session cannot be found",
        data: {},
      });
    }

    return res.status(200).json({
      success: "true",
      message: "Session fetched successfully",
      data: session,
    });
  }
);
