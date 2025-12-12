import { RequestHandler } from "express";
import { prisma } from "../configs/db";
import { signupSchema } from "../schemas/auth.schema";
import bcrypt from "bcryptjs";
import z from "zod";

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
          .send({ message: "User with this email already exists" });
      else
        return res.status(409).send({ message: "Username should be unique" });
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
    });

    if (!user) {
      return res.status(500).send({
        message: "Unexpected failure while creating user",
      });
    }

    const { password: _omit, ...safeUser } = user;

    return res.status(201).send({
      user: safeUser,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error: error });
  }
};

export const login: RequestHandler = (req, res) => {};

export const logout: RequestHandler = (req, res) => {};
