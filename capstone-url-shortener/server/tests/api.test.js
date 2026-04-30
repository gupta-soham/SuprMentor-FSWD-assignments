const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const urlRoutes = require("../src/routes/urlRoutes");
const Url = require("../src/models/Url");

let app;

beforeAll(async () => {
  const uri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/urlshortener_test";
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.use("/", urlRoutes);
});

afterAll(async () => {
  await Url.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Url.deleteMany({});
});

describe("POST /api/shorten", () => {
  test("shortens a valid URL and returns 201", async () => {
    const res = await request(app)
      .post("/api/shorten")
      .send({ url: "https://example.com/long-page" });

    expect(res.status).toBe(201);
    expect(res.body.shortCode).toBeDefined();
    expect(res.body.longUrl).toContain("example.com");
    expect(res.body.created).toBe(true);
  });

  test("deduplicates the same URL", async () => {
    const url = "https://example.com/dedup";
    const first = await request(app).post("/api/shorten").send({ url });
    const second = await request(app).post("/api/shorten").send({ url });

    expect(first.body.shortCode).toBe(second.body.shortCode);
    expect(second.body.created).toBe(false);
  });

  test("rejects an invalid URL", async () => {
    const res = await request(app)
      .post("/api/shorten")
      .send({ url: "not-a-url" });
    expect(res.status).toBe(400);
  });

  test("rejects a shortener URL (blocked domain)", async () => {
    const res = await request(app)
      .post("/api/shorten")
      .send({ url: "https://bit.ly/abc123" });
    expect(res.status).toBe(400);
  });

  test("rejects missing url field", async () => {
    const res = await request(app).post("/api/shorten").send({});
    expect(res.status).toBe(400);
  });
});

describe("GET /:code (redirect)", () => {
  test("redirects to the long URL with 302", async () => {
    const created = await request(app)
      .post("/api/shorten")
      .send({ url: "https://example.com/redirect-target" });

    const res = await request(app).get(`/${created.body.shortCode}`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("example.com/redirect-target");
  });

  test("increments click count on redirect", async () => {
    const created = await request(app)
      .post("/api/shorten")
      .send({ url: "https://example.com/click-count" });

    await request(app).get(`/${created.body.shortCode}`);
    await request(app).get(`/${created.body.shortCode}`);

    const stats = await request(app).get(
      `/api/urls/${created.body.shortCode}/stats`,
    );
    expect(stats.body.clicks).toBe(2);
  });

  test("returns 404 for unknown code", async () => {
    const res = await request(app).get("/ZZZZZZZ");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/urls", () => {
  test("returns a paginated list", async () => {
    await request(app).post("/api/shorten").send({ url: "https://a.com" });
    await request(app).post("/api/shorten").send({ url: "https://b.com" });

    const res = await request(app).get("/api/urls");
    expect(res.status).toBe(200);
    expect(res.body.urls.length).toBe(2);
    expect(res.body.total).toBe(2);
  });
});

describe("DELETE /api/urls/:code", () => {
  test("deletes an existing URL", async () => {
    const created = await request(app)
      .post("/api/shorten")
      .send({ url: "https://example.com/delete-me" });

    const del = await request(app).delete(
      `/api/urls/${created.body.shortCode}`,
    );
    expect(del.status).toBe(200);
    expect(del.body.deleted).toBe(true);

    const check = await request(app).get(`/${created.body.shortCode}`);
    expect(check.status).toBe(404);
  });
});
