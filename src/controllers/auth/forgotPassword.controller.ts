import { Request, Response, NextFunction } from "express";
import prisma from "../../db/database";
import { catchAsync } from "../../utils/catch-async";
import { createRawToken, hashToken } from "../../utils/reset.token";
import { sendResetEmail } from "../../utils/send-reset.email";

const RESET_MINUTES = 15;
const APP_ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";
// const APP_ORIGIN = "http://localhost:3000";


export const forgotPassword = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const email = String(req.body?.email || "").trim().toLowerCase();

        const generic = { message: `We sent an eamil to ${email} please check your email` };
        if (!email) return res.status(200).json(generic);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.isActive || user.loginType !== "password") {
            return res.status(200).json(generic);
        }

        await prisma.passwordReset.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true },
        });

        const raw = createRawToken(32);
        const tokenHash = hashToken(raw);
        const expires = new Date(Date.now() + RESET_MINUTES * 60 * 1000);

        await prisma.passwordReset.create({
            data: { userId: user.id, tokenHash, expiresAt: expires },
        });

        const resetLink = `${APP_ORIGIN}/reset?token=${raw}`;

        await sendResetEmail(user.email, resetLink);

        return res.status(200).json(generic);
    }
);
