import { Request, Response, NextFunction } from "express";
import prisma from "../../db/database";
import { catchAsync } from "../../utils/catch-async";
import { hashToken } from "../../utils/reset.token";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const resetPassword = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
        const token = String(req.body?.token || "");
        const newPassword = String(req.body?.newPassword || "");

        if (!token || !newPassword) {
            return res.status(400).json({ message: "token and newPassword required" });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const tokenHash = hashToken(token);

        const reset = await prisma.passwordReset.findUnique({
            where: { tokenHash },
            include: { user: true },
        });

        if (!reset || reset.used || reset.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hash = await bcrypt.hash(newPassword, 12);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: reset.userId },
                data: { password: hash },
            }),
            prisma.passwordReset.update({
                where: { tokenHash },
                data: { used: true },
            }),

            // prisma.refreshToken.deleteMany({ where: { userId: reset.userId } }),
        ]);

        const tokenJwt = jwt.sign(
            { id: reset.user.id, email: reset.user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Your password is reset successfully",
            data: {
                token: tokenJwt,
                id: reset.user.id,
                email: reset.user.email,
                xmppUserId: reset.user.xmppUserId,
            },
        });
    }
);
