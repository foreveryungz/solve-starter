import { describe, expect, it } from "vitest";
import { request, setupTestServer } from "./helpers";

describe("auth api", () => {
  setupTestServer();

  it("should return 400 when email and password are missing", async () => {
    const { response, body } = await request("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "email and password are required" });
  });

  it("should return 400 when email and password are not strings", async () => {
    const { response, body } = await request("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: 1, password: 2 }),
    });

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "email and password must be strings" });
  });

  it("should return 400 when email format is invalid", async () => {
    const { response, body } = await request("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "invalidemailformat",
        password: "12345678",
      }),
    });

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "invalid email format" });
  });

  it("should return 200 when login is successful", async () => {
    const { response, body } = await request("/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "alice@example.com",
        password: "password1",
      }),
    });

    expect(response.status).toBe(200);
    expect(body).toEqual({ token: expect.any(String) });
  });
});
