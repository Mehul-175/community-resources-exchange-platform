import jwt, { Secret, SignOptions } from "jsonwebtoken";
import crypto from 'crypto';
import { prisma } from "./db";

const ACCESS_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET as string;

const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"];
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"];

export const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    const accessToken = jwt.sign(
      { userId, type: "access" },
      ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId, type: "refresh" },
      REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRY }
    );

    const hashRefreshToken = crypto.createHmac('sha256', REFRESH_SECRET).update(refreshToken).digest('hex');

    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashRefreshToken },
    });

    return { accessToken, refreshToken };
  } catch {
    throw new Error("Something went wrong while generating tokens");
  }
};
