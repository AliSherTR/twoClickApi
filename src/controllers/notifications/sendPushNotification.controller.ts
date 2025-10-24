import { Request, Response, NextFunction } from "express";
import prisma from "../../db/database";
import { sendPushNotification } from "../../lib/firebase";
import { catchAsync } from "../../utils/catch-async";

export const sendNotification = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { xmppUserId, message, senderXMPPId } = req.body;

    if (!xmppUserId || !message || !senderXMPPId) {
        return res.status(400).json({ message: "XMPP ID, message, and sender XMPP ID are required" });
    }

    // Fetch the FCM token 
    const user = await prisma.user.findUnique({
        where: { xmppUserId },
    });

    if (!user || !user.fcmToken) {
        return res.status(404).json({ message: "FCM token not found for the user" });
    }

    try {
        await sendPushNotification(user.fcmToken, senderXMPPId, message);
        return res.status(200).json({ message: "Notification sent successfully" });
    } catch (error: any) {
        console.error("Error sending push notification:", error);


        if (error.code === "messaging/registration-token-not-registered" || error.code === "messaging/invalid-registration-token") {
            await prisma.user.update({
                where: { xmppUserId },
                data: { fcmToken: null },
            });

            return res.status(410).json({
                message: "FCM token is invalid or expired. User must re-register their token.",
                error: error.message,
            });
        }

        return res.status(500).json({
            message: "Failed to send push notification",
            error: error.message || "Unknown error",
        });
    }
});
