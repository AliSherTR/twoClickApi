import { Router } from "express";
import { loginUser } from "../../controllers/auth/auth.controller";

const router = Router();

router.post("/login", loginUser);

export default router;
