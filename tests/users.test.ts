import { describe, expect, it } from "vitest";
import { request, setupTestServer } from "./helpers";

describe("users api", () => {
  setupTestServer();

  it("should return 400 when email and password are missing", async () => {
    const { response, body } = await request("/users/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "email and password are required" });
  });

  it("should return 400 when email and password are not strings", async () => {
    const { response, body } = await request("/users/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: 1, password: 2 }),
    });

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "email and password must be strings" });
  });

  it("should return 400 when email format is invalid", async () => {
    const { response, body } = await request("/users/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "invalidemailformat", password: "123456" }),
    });

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "invalid email format" });
  });

  it("should return 400 when password length is less than 8 characters", async () => {
    const { response, body } = await request("/users/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "register@example.com", password: "123" }),
    });

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "password must be at least 8 characters" });
  });

  it("should return 400 when password length is more than 72 characters", async () => {
    const { response, body } = await request("/users/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "register@example.com",
        password: "a".repeat(73),
      }),
    });

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "password must be at most 72 characters" });
  });

  it("should return 409 when email is already registered", async () => {
    const { response, body } = await request("/users/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "alice@example.com",
        password: "12345678",
      }),
    });

    expect(response.status).toBe(409);
    expect(body).toEqual({ error: "email taken" });
  });

  it("should return 201 when registration is successful", async () => {
    const { response, body } = await request("/users/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "register@example.com",
        password: "12345678",
      }),
    });

    expect(response.status).toBe(201);
    expect(body).toEqual({ ok: true });
  });
});
