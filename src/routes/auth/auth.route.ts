import { Router } from "express";
import { loginUser, registerUser, loginWithEmail } from "../../controllers/auth/auth.controller";
import { forgotPassword } from "../../controllers/auth/forgotPassword.controller";
import { resetPassword } from "../../controllers/auth/resetPassword.controller";
import { saveFcmToken } from "../../controllers/auth/saveFcmToken.controller";

const router = Router();

router.post("/login", loginUser)
router.post("/register", registerUser)
router.post("/email-login", loginWithEmail)

router.post("/forgot", forgotPassword)
router.post("/reset", resetPassword)

router.post("/save-fcm-token", saveFcmToken);

export default router;
