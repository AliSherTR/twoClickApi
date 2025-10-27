import { Router } from "express";
import { sendNotification } from "../../controllers/notifications/sendPushNotification.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const notificationRouter = Router();

notificationRouter.post("/send-push-notification", authMiddleware, sendNotification);

export default notificationRouter;
