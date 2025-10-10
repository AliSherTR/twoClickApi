import { Router } from "express";
import { loginUser, registerUser, loginWithEmail } from "../../controllers/auth/auth.controller";
import { forgotPassword } from "../../controllers/auth/forgotPassword.controller";
import { resetPassword } from "../../controllers/auth/resetPassword.controller";

const router = Router();

router.post("/login", loginUser)
router.post("/register", registerUser)
router.post("/email-login", loginWithEmail)

router.post("/forgot", forgotPassword)
router.post("/reset", resetPassword)

export default router;
