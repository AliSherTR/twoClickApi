import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createSession } from "../../controllers/session/session.controller";

const router = Router();

router.post("/", authMiddleware, createSession);

export default router;
