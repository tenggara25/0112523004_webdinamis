import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthUser = {
  id: number;
  email: string;
  role: "admin" | "operator" | "viewer";
};

export type AuthRequest = Request & {
  user?: AuthUser;
};

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as unknown as AuthUser;

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid atau expired" });
  }
};
