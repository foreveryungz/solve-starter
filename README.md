# Backend Assessment — Starter Repo

Welcome, and thanks for taking the time. This should take about **2 hours — please don't go over.** We're testing judgment under time pressure, not stamina.

> **You do NOT need any cloud account or external services.** Everything runs locally with Node.js and a local SQLite file. This is a code review and fix task.

## The situation

This repo is a small REST API (Express + TypeScript, SQLite for storage) for users and their notes. It **runs** — but it was put together carelessly by someone in a hurry. Your job is to review it like a senior engineer reviewing a colleague's pull request: find what's wrong, fix what matters most, and clearly explain the rest.

## Running it

```
npm install
npm start        # starts the API on http://localhost:3000
npm test         # runs the test suite
```

Endpoints: `POST /auth/login`, `POST /users/register`, `GET /notes`, `GET /notes/:id`, `POST /notes`.
Seeded users: `alice@example.com` / `password1` and `bob@example.com` / `password2`.

## What's here

```
src/
  index.ts     App bootstrap, middleware, error handling.
  config.ts    Configuration.
  db.ts        SQLite setup, password hashing, seed data.
  auth.ts      Login + auth middleware.
  users.ts     Registration.
  notes.ts     Notes CRUD.
tests/         The (minimal) test suite.
```

# Backend Engineer Case Study

Please see [REVIEW.md](./REVIEW.md) for the code review, findings, changes, and reasoning.
