import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const middleware = (req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies["jwt"];
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "Jwt Secret is not defined please check your env configaration "
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded == "object") {
      req.userId = decoded.userId;
      next();
    } else {
      res.status(401).json({
        message: "Invalid token playlode",
      });
    }
  } catch (error) {
    res.status(401).json({
      message: "Invalid token or expired token",
    });
  }
};

export default middleware;
