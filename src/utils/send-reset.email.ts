
import transporter from "../lib/mailer";

function buildHtml(link: string) {
    return `
    <div style="font-family:system-ui,Segoe UI,Roboto,Arial">
      <h2>Password reset request</h2>
      <p>We received a request to reset your password.</p>
      <p>
        Click the button within 15 minutes:
      </p>
      <p>
        <a href="${link}" style="display:inline-block;padding:10px 16px;
          text-decoration:none;border-radius:6px;background:#0d6efd;color:#fff">
          Reset Password
        </a>
      </p>
      <p>If the button fails, use this link:</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you did not request this, ignore this email.</p>
    </div>
  `;
}

function buildText(link: string) {
    return [
        "Password reset request",
        "",
        "We received a request to reset your password.",
        "Open this link within 15 minutes:",
        link,
        "",
        "If you did not request this, ignore this email.",
    ].join("\n");
}

export async function sendResetEmail(email: string, link: string) {
    const from = `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`;

    const info = await transporter.sendMail({
        from,
        to: email,
        subject: "Reset your password",
        text: buildText(link),
        html: buildHtml(link),
    });

    if (process.env.NODE_ENV !== "production") {
        console.log("Reset email sent:", { to: email, id: info.messageId, link });
    } else {
        console.log("Reset email queued:", { to: email, id: info.messageId });
    }

    return info;
}
