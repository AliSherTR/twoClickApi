import { Router } from "express";
import { sendNotification } from "../../controllers/notifications/sendPushNotification.controller";

const notificationRouter = Router();

notificationRouter.post("/send-push-notification", sendNotification);

export default notificationRouter;
