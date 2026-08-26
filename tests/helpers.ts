import { afterEach, beforeEach, vi } from "vitest";
import fs from "fs";
import os from "os";
import path from "path";
import type { AddressInfo } from "net";
import type { Server } from "http";
import type { Database as SqliteDatabase } from "better-sqlite3";

export let server: Server | undefined;
export let baseUrl = "";
export let db: SqliteDatabase | undefined;
let dbFile = "";

export async function request(pathname: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${pathname}`, init);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { response, body };
}

export function setupTestServer() {
  beforeEach(async () => {
    dbFile = path.join(
      os.tmpdir(),
      `test-${Date.now()}-${Math.random().toString(16).slice(2)}.db`,
    );

    process.env.DB_PATH = dbFile;
    process.env.JWT_SECRET = "test-secret";

    vi.resetModules();

    const { createApp } = await import("../src/index");
    const dbModule = await import("../src/db");
    db = dbModule.db;
    await dbModule.seedPromise;

    server = createApp().listen(0);
    await new Promise<void>((resolve) => server!.once("listening", resolve));

    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      if (!server) return resolve();
      server.close((err) => (err ? reject(err) : resolve()));
    });

    db?.close();
    db = undefined;

    if (dbFile && fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
    }

    server = undefined;
    baseUrl = "";
    delete process.env.DB_PATH;
    delete process.env.JWT_SECRET;
  });
}
