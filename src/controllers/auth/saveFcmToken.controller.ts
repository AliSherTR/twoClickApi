import { Request, Response, NextFunction } from "express";
import prisma from "../../db/database";
import { catchAsync } from "../../utils/catch-async";

export const saveFcmToken = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { xmppUserId, fcmToken } = req.body;

    if (!xmppUserId || !fcmToken) {
        return res.status(400).json({ message: "XMPP ID and FCM token are required" });
    }

    const user = await prisma.user.update({
        where: { xmppUserId },
        data: { fcmToken },
        select: {
            id: true,
            xmppUserId: true,
            fcmToken: true,
            email: true,
            name: true,
            xmppPassword: true,
            loginType: true,
            isActive: true,
            createdAt: true,
            updatedAt: true

        },
    });

    return res.status(200).json({ message: "FCM token saved successfully", user });
});
