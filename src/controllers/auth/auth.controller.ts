import { Request, Response, NextFunction } from "express";
import prisma from "../../db/database";
import { verifyGoogleToken } from "../../external-services/google-auth";
import jwt from "jsonwebtoken";
import { catchAsync } from "../../utils/catch-async";
import { AppError } from "../../utils/app-error";
import { registerXmppUser } from "../../utils/register-xmpp-user";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

export const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, token } = req.body;

    if (!email || !token) {
      res.status(400).json({
        message: "Email and Token are required",
      });
    }

    const verifiedAccount = await verifyGoogleToken(token);

    // find existing user
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      if (existingUser.email !== verifiedAccount.email) {
        res.json(400).json({
          message: "You are not allowed to visit this api",
        });
      }

      const payload = {
        id: existingUser.id,
        email: existingUser.email,
      };

      const authToken = jwt.sign(payload, process.env.JWT_SECRET as string);

      return res.status(200).json({
        status: 200,
        message: "Logged in successfully",
        data: {
          id: existingUser.id,
          xmppUserId: existingUser.xmppUserId,
          password: existingUser.xmppPassword,
          email: existingUser.email,
          token: authToken,
        },
      });
    }

    // create new user

    // return { id , xmppUserId , xmppPassword , jwttoken }
    const xmppPassword = randomBytes(32).toString("hex");
    const xmppEmail = email.replace(/[^a-zA-Z0-9]/g, "_");
    const xmppUser = await registerXmppUser(xmppEmail, xmppPassword);

    if (xmppUser) {
      const newUser = await prisma.user.create({
        data: {
          email,
          xmppUserId: xmppEmail,
          xmppPassword,
          password: xmppPassword,
          loginType: "google",
          name: verifiedAccount.name,
        },
      });

      const payload = {
        id: newUser.id,
        email: newUser.email,
      };

      const authToken = jwt.sign(payload, process.env.JWT_SECRET as string);

      return res.status(200).json({
        status: 200,
        message: "Logged in successfully",
        data: {
          id: newUser.id,
          xmppUserId: newUser.xmppUserId,
          password: newUser.xmppPassword,
          email: newUser.email,
          token: authToken,
        },
      });
    }

    return next(new AppError("Invalid Google login", 401));
  }
);


function validate(body: any) {
  const errors: string[] = [];
  if (!body?.email || typeof body.email !== "string") errors.push("email is required");
  if (!body?.password || typeof body.password !== "string") errors.push("password is required");
  if (errors.length) throw new AppError(errors.join(", "), 400);
}

function makeXmppId(email: string) {
  const local = email.split("@")[0] || "user";
  const base = local.toLowerCase().replace(/[^a-z0-9]/gi, "_").slice(0, 24);
  const suffix = randomBytes(3).toString("hex");
  return `${base}_${suffix}`;
}



export const registerUser = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    validate(req.body);
    const { email, password } = req.body as { email: string; password: string };


    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }


    const xmppUserId = makeXmppId(email);
    const xmppPassword = randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(password, 12);
    const displayName =
      email.split("@")[0].replace(/[\W_]+/g, " ").trim() || "New User";

    const xmppOk = await registerXmppUser(xmppUserId, xmppPassword);
    if (!xmppOk) {
      throw new AppError("XMPP registration failed", 502);
    }

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          xmppUserId,
          xmppPassword,
          password: passwordHash,
          loginType: "password",
          name: displayName,
        },
      });
    } catch (err: any) {
      throw new AppError("Failed to save user", 500);
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    return res.status(201).json({
      status: 201,
      message: "User register successfully",
      data: {
        id: user.id,
        email: user.email,
        xmppUserId: user.xmppUserId,
        xmppPassword: user.xmppPassword,
        token,
        createdAt: user.createdAt,
      },
    });
  }
);



export const loginWithEmail = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    validate(req.body);
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.loginType !== "password") {
      return res.status(400).json({
        message: "This account does not use password login. Use your original login method.",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      status: 200,
      message: "User login successfully",
      data: {
        id: user.id,
        email: user.email,
        xmppUserId: user.xmppUserId,
        xmppPassword: user.xmppPassword,
        token,
      },
    });
  }
);