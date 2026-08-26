import { Router } from "express";
import { db, hashPassword } from "./db";

export const usersRouter = Router();

usersRouter.post("/register", async (req, res) => {
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

  // validasi panjang password
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "password must be at least 8 characters" });
  }
  if (password.length > 72) {
    return res
      .status(400)
      .json({ error: "password must be at most 72 characters" });
  }

  try {
    // 2. Select check
    const existing = db
      .prepare(`SELECT id FROM users WHERE email = ?`)
      .get(trimmedEmail);

    if (existing) {
      return res.status(409).json({ error: "email taken" });
    }

    // 3. Hash password
    const hashedPassword = await hashPassword(password);

    // 4. Insert user
    db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(
      trimmedEmail,
      hashedPassword,
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("register failed:", err);
    res.status(500).json({ error: "internal server error" });
  }
});
