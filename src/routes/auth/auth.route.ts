import { Router } from "express";
import { loginUser, registerUser, loginWithEmail } from "../../controllers/auth/auth.controller";
import { forgotPassword } from "../../controllers/auth/forgotPassword.controller";
import { resetPassword } from "../../controllers/auth/resetPassword.controller";
import { saveFcmToken } from "../../controllers/auth/saveFcmToken.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { updatePassword } from "../../controllers/auth/auth.controller";

const router = Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/email-login", loginWithEmail);

router.post("/forgot", forgotPassword);
router.post("/reset", resetPassword);

router.post("/save-fcm-token", authMiddleware, saveFcmToken);
router.post("/update-password", authMiddleware, updatePassword);

export default router;
