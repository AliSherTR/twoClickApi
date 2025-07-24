import { OAuth2Client } from "google-auth-library";
import { AppError } from "../utils/app-error";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleUser {
  email: string;
  name: string;
  sub: string; // Google user ID
}

export async function verifyGoogleToken(token: string): Promise<GoogleUser> {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google token");
    }
    return {
      email: payload.email || "",
      name: payload.name || "",
      sub: payload.sub,
    };
  } catch (error: any) {
    console.error("Google token verification failed:", error);
    if (error.message.includes("Invalid token signature")) {
      throw new AppError(
        "Invalid Google token signature. Please check the token or Client ID.",
        401
      );
    }
    throw new AppError(
      `Google token verification failed: ${error.message}`,
      400
    );
  }
}
