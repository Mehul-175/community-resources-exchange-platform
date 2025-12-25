import { RequestHandler } from "express";
import { prisma } from "../libs/db";
import { signupSchema, loginSchema } from "../schemas/auth.schema";
import bcrypt from "bcryptjs";
import { generateAccessAndRefreshTokens } from "../libs/generateTokens";

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite?: "strict" | "lax" | "none";
  maxAge?: number;
}

export const signup: RequestHandler = async (req, res) => {
  try {
    const parsedReq = await signupSchema.parseAsync(req.body);
    const { email, username, password, firstname, lastname, bio, profilePic } =
      parsedReq;

    // Check if email or username already exists or not
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (existingUser) {
      if (existingUser.email === email)
        return res
          .status(409)
          .json({ message: "User with this email already exists" });
      else
        return res.status(409).json({ message: "Username should be unique" });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    //Create user
    const user = await prisma.user.create({
      data: {
        email: email,
        username: username,
        password: hashedPassword,
        firstName: firstname,
        lastName: lastname,
        bio: bio,
        profilePic: profilePic,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        profilePic: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(500).json({
        message: "Unexpected failure while creating user",
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user.id
    );

    const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res.cookie("refreshToken", refreshToken, options).status(201).json({
      user,
      accessToken,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error: error });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const parsedReq = await loginSchema.parseAsync(req.body);
    const { email, username, password } = parsedReq;

    if (!email && !username) {
      return res.status(400).json({ message: "Username or Email is required" });
    }

    //Check if user exists or not
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
    if (!user) return res.status(401).json({ message: "Invalid Credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid Credentials" });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user.id
    );
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    return res.cookie("refreshToken", refreshToken, options).status(201).json({
      safeUser,
      accessToken,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error: error });
  }
};

export const logout: RequestHandler = (req, res) => {
  
};
