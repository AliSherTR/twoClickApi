import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  createSession,
  getAllSessions,
  getSessionById,
} from "../../controllers/session/session.controller";

const router = Router();

router.post("/", authMiddleware, createSession);
router.get("/", authMiddleware, getAllSessions);
router.get("/:id", authMiddleware, getSessionById);
export default router;
