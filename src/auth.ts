import { Router } from "express";
import jwt from "jsonwebtoken";
import { db, verifyPassword } from "./db";
import { config } from "./config";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as any;

  // 1. Validasi input
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return res
      .status(400)
      .json({ error: "email and password must be strings" });
  }

  const trimmedEmail = email.trim().toLowerCase();

  // validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({ error: "invalid email format" });
  }

  try {
    const row = db
      .prepare(`SELECT * FROM users WHERE email = ?`)
      .get(trimmedEmail) as any;

    if (!row) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const valid = await verifyPassword(password, row.password);
    if (!valid) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const token = jwt.sign(
      { userId: row.id, email: row.email },
      config.jwtSecret,
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("login failed:", err);
    res.status(500).json({ error: "internal server error" });
  }
});

export function authMiddleware(req: any, res: any, next: any) {
  const header = req.headers.authorization || "";
  const token = header.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: "unauthorized" });
  }
}
