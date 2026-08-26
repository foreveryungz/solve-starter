import { Router } from "express";
import { db } from "./db";
import { authMiddleware } from "./auth";

export const notesRouter = Router();

notesRouter.get("/", authMiddleware, (req: any, res) => {
  try {
    const notes = db
      .prepare(
        "SELECT id, user_id, title, body FROM notes WHERE user_id = ? ORDER BY id ASC",
      )
      .all(req.user.userId) as any[];
    res.json(notes);
  } catch (err) {
    console.error("get notes failed:", err);
    res.status(500).json({ error: "internal server error" });
  }
});

notesRouter.get("/:id", authMiddleware, (req: any, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "invalid note id" });
  }

  try {
    const note = db
      .prepare(
        "SELECT id, user_id, title, body FROM notes WHERE id = ? AND user_id = ?",
      )
      .get(id, req.user.userId);
    if (!note) {
      return res.status(404).json({ error: "note not found" });
    }
    res.json(note);
  } catch (err) {
    console.error("get note failed:", err);
    res.status(500).json({ error: "internal server error" });
  }
});

notesRouter.post("/", authMiddleware, (req: any, res) => {
  const { title, body } = req.body as any;
  if (
    typeof title !== "string" ||
    typeof body !== "string" ||
    !title ||
    !body
  ) {
    return res.status(400).json({ error: "title and body are required" });
  }

  if (title.length > 200 || body.length > 10000) {
    return res.status(400).json({ error: "title or body too long" });
  }

  try {
    const note = db
      .prepare("INSERT INTO notes (user_id, title, body) VALUES (?, ?, ?)")
      .run(req.user.userId, title, body);
    res.status(201).json({
      id: note.lastInsertRowid,
      user_id: req.user.userId,
      title,
      body,
    });
  } catch (err) {
    console.error("create note failed:", err);
    res.status(500).json({ error: "internal server error" });
  }
});
