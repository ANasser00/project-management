import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; username: string; email: string };
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.token as string | undefined;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, JWT_SECRET) as string | JwtPayload;

    let userId: number | null = null;
    if (typeof decoded === "string") {
      const n = Number(decoded);
      userId = Number.isFinite(n) ? n : null;
    } else {
      const sub = (decoded as JwtPayload).sub;
      if (typeof sub === "string") {
        const n = Number(sub);
        userId = Number.isFinite(n) ? n : null;
      } else if (typeof sub === "number") {
        userId = sub;
      }
    }

    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const user = await prisma.user.findUnique({
      where: { userId: userId },
      select: { userId: true, username: true, email: true },
    });
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
