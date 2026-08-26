import { describe, expect, it } from "vitest";
import { request, setupTestServer } from "./helpers";
import e from "express";

async function login(email: string, password: string) {
  const { response, body } = await request("/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  expect(response.status).toBe(200);
  expect(body.token).toEqual(expect.any(String));
  return body.token as string;
}

describe("notes api", () => {
  setupTestServer();

  it("should return 401 when no token is provided", async () => {
    const { response, body } = await request("/notes", {
      method: "GET",
    });

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "unauthorized" });
  });

  it("should return 200 and only notes belonging to the authenticated user", async () => {
    const token = await login("alice@example.com", "password1");

    const { response, body } = await request("/notes", {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.status).toBe(200);
    expect(body).toEqual([
      {
        id: 1,
        user_id: 1,
        title: "Alice note",
        body: "private thoughts",
      },
    ]);
  });

  it("should return 200 and the note belonging to the authenticated user", async () => {
    const token = await login("alice@example.com", "password1");

    const { response, body } = await request("/notes/1", {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.status).toBe(200);
    expect(body).toEqual({
      id: 1,
      user_id: 1,
      title: "Alice note",
      body: "private thoughts",
    });
  });

  it("should return 404 when note is not found", async () => {
    const token = await login("alice@example.com", "password1");

    const { response, body } = await request("/notes/2", {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "note not found" });
  });

  it("should return 200 when note is created", async () => {
    const token = await login("alice@example.com", "password1");

    const { response, body } = await request("/notes", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ title: "Alice's second note", body: "secret" }),
    });

    expect(response.status).toBe(201);
    expect(body).toEqual({
      id: expect.any(Number),
      user_id: 1,
      title: "Alice's second note",
      body: "secret",
    });
  });
});
