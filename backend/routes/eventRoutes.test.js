const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index");

let mongoServer;
jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Events API", () => {
  afterEach(async () => {
    await mongoose.connection.db.dropCollection("events").catch(() => {});
  });

  it("rejects invalid payload on POST /api/event", async () => {
    const res = await request(app).post("/api/event").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("sets snapshotUrl to null when no base64Image provided", async () => {
    const payload = {
      eventType: "fall",
      timestamp: new Date().toISOString(),
      priority: 2,
      cameraId: "testCam",
    };
    const res = await request(app).post("/api/event").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.event.snapshotUrl).toBeNull();
  });

  it("accepts valid event and returns all expected fields on POST /api/event", async () => {
    const payload = {
      eventType: "fire",
      timestamp: new Date().toISOString(),
      priority: 1,
      cameraId: "camX",
      location: "Test Zone",
      severity: "high",
      status: "dispatched",
      notes: "Simulated test"
    };
    const res = await request(app).post("/api/event").send(payload);
    expect(res.status).toBe(201);
    const evt = res.body.event;
    expect(evt.eventType).toBe("fire");
    expect(evt.priority).toBe(1);
    expect(evt.cameraId).toBe("camX");
    expect(evt.location).toBe("Test Zone");
    expect(evt.severity).toBe("high");
    expect(evt.status).toBe("dispatched");
    expect(evt.notes).toBe("Simulated test");
    expect(evt).toHaveProperty("snapshotUrl");
    expect(evt).toHaveProperty("eventId");
    expect(evt).toHaveProperty("timestamp");
  });

  it("lists events with pagination & type filter on GET /api/events", async () => {
    await request(app).post("/api/event").send({
      eventType: "fire",
      timestamp: new Date().toISOString(),
      priority: 1,
      cameraId: "camX"
    });

    const res = await request(app).get("/api/events?type=fire&limit=5&page=1");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("page", 1);
    expect(res.body).toHaveProperty("limit", 5);
    expect(Array.isArray(res.body.events)).toBe(true);
    expect(res.body.events[0]).toHaveProperty("eventType", "fire");
  });

  it("bulk deletes events older than a date on DELETE /api/events", async () => {
    const res = await request(app)
      .delete("/api/events?olderThan=2025-01-01");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("deletedCount");
    expect(typeof res.body.deletedCount).toBe("number");
  });

  it("exports CSV on GET /api/events/export", async () => {
    // Add one event for export
    await request(app).post("/api/event").send({
      eventType: "fire",
      timestamp: new Date().toISOString(),
      priority: 1,
      cameraId: "camX",
      location: "Zone A",
      severity: "medium",
      status: "pending",
      notes: "CSV Export Test"
    });

    const res = await request(app).get("/api/events/export");
    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toMatch(/text\/csv/);

    // Header row check — include double quotes as csv-lib wraps fields
    expect(res.text).toContain(
      `"eventType","timestamp","priority","cameraId","location","severity","status","notes"`
    );
  });
});
