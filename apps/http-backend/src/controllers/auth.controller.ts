import { signInschema, signUpSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function signUpController(req: Request, res: Response) {
  const validatedInput = signUpSchema.safeParse(req.body);

  if (!validatedInput.success) {
    res.status(400).json({
      message: "Invalid type input ",
      error: validatedInput.error.issues,
    });
    return;
  }

  const { username, name, password } = validatedInput.data;

  try {
    const saltrounds = parseInt(process.env.SALTROUNDS || "10");
    const hashedPassword = await bcrypt.hash(password, saltrounds);
    const creatUser = await prismaClient.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
      },
    });

    const user = {
      id: creatUser.id,
      username: creatUser.username,
      password: creatUser.password,
      name: creatUser.name,
    };

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT SECRET IS NOT STRING IN SIGNUPCONTROLLER");
    }

    const token = jwt.sign(user, process.env.JWT_SECRET);

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "user signedup",
      user,
      token,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      res.status(409).json({
        message: "username already exists",
      });
      return;
    }

    res.status(500).json({
      message: "An error occur during sign up,please try again later",
    });
    return;
  }
}

export async function signInController(req: Request, res: Response) {
  const validatedInput = signInschema.safeParse(req.body);
  if (!validatedInput.success) {
    res.status(400).json({
      message: "Invalid input type",
    });
    return;
  }
  const { username, password } = validatedInput.data;

  try {
    const userFound = await prismaClient.user.findUnique({
      where: {
        username,
      },
    });

    if (!userFound || !(await bcrypt.compare(password, userFound.password))) {
      res.status(401).json({
        message: "Wrong username or password",
      });
      return;
    }

    const user = {
      id: userFound.id,
      username: userFound.username,
      password: userFound.password,
    };
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET IS NOT STRING IN SIGNIN CONTROLLER");
    }

    const token = jwt.sign(user, process.env.JWT_SECRET);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "signin successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      message: "An error occurred while signing in. Please try again later.",
    });
    return;
  }
}

export async function signOutController(req: Request, res: Response) {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
    });

    res.status(200).json({
      message: "user signout successfully",
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "error occur while signuot",
    });
  }
}

export async function infoController(req: Request, res: Response) {
  const userId = req.userId;

  if (!userId) {
    res.status(400).json({
      message: "useId is required",
    });
    return;
  }

  try {
    const userFound = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userFound) {
      res.status(404).json({
        message: "User not Found",
      });
      return;
    }

    const user = {
      username: userFound.username,
      password: userFound.password,
      name: userFound.name,
    };

    res.status(200).json({
      message: "user info",
      user,
    });
    return;
  } catch (error) {
    console.error("infocontroller error", error);
    res.status(500).json({
      message:
        "An error occurred while retrieving user info. Please try again later.",
    });
    return;
  }
}
