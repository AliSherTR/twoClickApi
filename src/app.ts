import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth/auth.route";
import sessionRoutes from "./routes/session/session.route";
import resetPageRouter from "./routes/auth/reset-page.route"
import notificationRouter from "./routes/notification/notification.route";
import { globalErrorHandler } from "./middlewares/global-error-handler";
import { verifyMailer } from "./lib/mailer";
import path from "path";


const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("src"));
dotenv.config();

const PORT = process.env.PORT;
app.use(resetPageRouter);
app.use("/api/auth", authRoutes);
app.use("/session", sessionRoutes);
app.use("/api", notificationRouter);


app.use("/static", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
}, require("express").static(path.join(process.cwd(), "public")));

app.get("/.well-known/assetlinks.json", (req: Request, res: Response) => {
  res.status(200).json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.click2.app",
        sha256_cert_fingerprints: [
          "89:14:04:F7:B6:18:0F:28:01:F2:D0:9E:37:C5:3A:34:3E:D5:A5:42:84:37:70:C6:50:31:3C:7B:10:02:5B:C1",
        ],
      },
    },
  ]);
});

verifyMailer().catch(() => { });
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
