
import nodemailer from "nodemailer";

const secure = String(process.env.SMTP_SECURE ?? "false") === "true";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure,
    auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
    },

});

export async function verifyMailer() {
    try {
        await transporter.verify();
        console.log("SMTP connected.");
    } catch (e) {
        console.error("SMTP verify failed:", e);
    }
}

export default transporter;
