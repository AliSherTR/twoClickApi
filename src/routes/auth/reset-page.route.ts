
import { Router } from "express";
const router = Router();

router.get("/reset", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    res.setHeader(
        "Content-Security-Policy",
        [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "connect-src 'self'",
            "img-src 'self' data:",
            "base-uri 'none'",
            "form-action 'self'",
            "frame-ancestors 'none'",
        ].join("; ")
    );
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store");

    res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Reset Password</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preload" href="/static/reset.js" as="script">
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;padding:24px;max-width:520px;margin:0 auto}
    .card{border:1px solid #ddd;border-radius:12px;padding:24px}
    h1{font-size:20px;margin:0 0 12px}
    .msg{margin-top:12px;font-size:14px}
    input,button{font-size:16px;padding:10px;border-radius:8px;border:1px solid #ccc;width:100%}
    button{border:0;margin-top:10px;background:#0d6efd;color:#fff}
    .hidden{display:none}
  </style>
</head>
<body>
  <div class="card">
    <h1>Set a new password</h1>
    <p id="status" class="msg"></p>
    <form id="form" autocomplete="off">
      <label for="password">New password</label>
      <input id="password" name="password" type="password" minlength="8" required
             placeholder="At least 8 characters" autocomplete="new-password" />
      <button type="submit">Reset Password</button>
    </form>
    <div id="done" class="msg hidden">Password reset successful. You can now log in in the app.</div>
  </div>

  <script src="/static/reset.js" defer></script>
</body>
</html>`);
});

export default router;
