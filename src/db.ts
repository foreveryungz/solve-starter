import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import { config } from "./config";

export const db = new Database(config.dbPath);
const SALT_ROUNDS = 12;

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    password TEXT
  );
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    body TEXT
  );
`);

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

async function seed() {
  const count = db.prepare("SELECT COUNT(*) as c FROM users").get() as any;
  if (count.c === 0) {
    db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(
      "alice@example.com",
      await hashPassword("password1"),
    );
    db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(
      "bob@example.com",
      await hashPassword("password2"),
    );
    db.prepare("INSERT INTO notes (user_id, title, body) VALUES (?, ?, ?)").run(
      1,
      "Alice note",
      "private thoughts",
    );
    db.prepare("INSERT INTO notes (user_id, title, body) VALUES (?, ?, ?)").run(
      2,
      "Bob note",
      "bob's secrets",
    );
  }
}

export const seedPromise = seed().catch((err) => {
  console.error("seeding failed:", err);
  throw err;
});
