import { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";

declare global {
  namespace Express {
    interface Request {
      user?: { email: string; name: string };
    }
  }
}

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authorization token is missing" });
    return;
  }
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(header.slice(7), secret);
    if (typeof payload.email !== "string") {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    req.user = {
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
