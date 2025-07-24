import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth/auth.route";
import sessionRoutes from "./routes/session/session.route";
import { globalErrorHandler } from "./middlewares/global-error-handler";

const app = express();
app.use(express.json());
app.use(bodyParser.json());
dotenv.config();

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
