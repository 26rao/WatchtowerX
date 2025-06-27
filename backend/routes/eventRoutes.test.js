const request = require("supertest");
const app = require("../index");

describe("Events API", () => {
  // Ensure clean test DB or mock as needed

  it("rejects invalid payload on POST /api/event", async () => {
    const res = await request(app).post("/api/event").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("accepts valid event on POST /api/event", async () => {
    const payload = {
      eventType: "fall",
      timestamp: new Date().toISOString(),
      priority: 2,
      cameraId: "testCam",
    };
    const res = await request(app).post("/api/event").send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body.event).toMatchObject({
      eventType: "fall",
      priority: 2,
      cameraId: "testCam",
    });
  });

  it("lists events with pagination on GET /api/events", async () => {
    const res = await request(app).get("/api/events?limit=5&page=1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("events");
    expect(Array.isArray(res.body.events)).toBe(true);
  });

  it("bulk deletes events older than a date on DELETE /api/events", async () => {
    const res = await request(app).delete("/api/events?olderThan=2025-01-01");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("deletedCount");
  });

  it("exports CSV on GET /api/events/export", async () => {
    const res = await request(app).get("/api/events/export");
    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toMatch(/text\/csv/);
  });
});
