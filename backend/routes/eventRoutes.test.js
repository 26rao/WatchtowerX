// WatchtowerX/backend/routes/eventRoutes.test.js

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { app, server } = require("../index");

let mongoServer;
jest.setTimeout(30000);

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  // disconnect mongoose & stop in-memory server
  await mongoose.disconnect();
  await mongoServer.stop();

  // close Express server if running
  if (app.server && typeof app.server.close === "function") {
    await new Promise(resolve => app.server.close(resolve));
  }
  if (app.cleanupJob) {
    app.cleanupJob.stop(); // ✅ stops cron job
  }
  if (server && typeof server.close === "function") {
    await new Promise(resolve => server.close(resolve));
  }
});

describe("Events API", () => {
  afterEach(async () => {
    // drop collection to reset between tests
    await mongoose.connection.db.dropCollection("events").catch(() => {});
  });

  it("rejects invalid payload on POST /api/event", async () => {
    const res = await request(app).post("/api/event").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("handles full ML payload on POST /api/event", async () => {
    const payload = {
      eventType:    "fall",
      timestamp:    new Date().toISOString(),
      cameraId:     "CAM-04-Warehouse",
      confidence:   0.92,
      priorityLabel:"High",
      snapshotData: "data:image/png;base64,AAAABB==",
      eventDetails: { description: "Detected fall pose" }
    };
    const res = await request(app).post("/api/event").send(payload);
    expect(res.status).toBe(201);
    const evt = res.body.event;
    expect(evt.priority).toBe(3);
    expect(evt.priorityLabel).toBe("High");
    expect(evt.confidence).toBeCloseTo(0.92);
    expect(evt.notes).toBe("Detected fall pose");
    expect(typeof evt.snapshotUrl).toBe("string");
  });

  it("lists events with pagination & filters on GET /api/events", async () => {
    const payload = {
      eventType:    "fire",
      timestamp:    new Date().toISOString(),
      cameraId:     "CAM-01",
      confidence:   0.75,
      priorityLabel:"Medium",
      snapshotData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
      eventDetails: { description: "Testing pagination" },
      location:     "Lab 3",
      severity:     "medium",
      status:       "pending",
      notes:        "Paginated fire"
    };

    // Insert & query
    await request(app).post("/api/event").send(payload);
    const res = await request(app).get("/api/events?type=fire&limit=5&page=1");
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
    expect(res.body.events.length).toBeGreaterThanOrEqual(1);

    const found = res.body.events.find(e => e.notes === "Paginated fire");
    expect(found).toBeDefined();
    expect(found).toMatchObject({
      eventType:     "fire",
      confidence:    0.75,
      priorityLabel: "Medium",
      notes:         "Paginated fire"
    });
  });

  it("bulk deletes events older than a date on DELETE /api/events", async () => {
    const res = await request(app)
      .delete("/api/events?olderThan=2025-01-01T00:00:00Z");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("deletedCount");
  });

  it("exports CSV including new fields on GET /api/events/export", async () => {
    await request(app).post("/api/event").send({
      eventType:    "fight",
      timestamp:    new Date().toISOString(),
      cameraId:     "CAM-02",
      confidence:   0.60,
      priorityLabel:"Low",
      snapshotData: "data:image/png;base64,BBBCCC==",
      eventDetails: { description: "Fight detected" }
    });
    const res = await request(app).get("/api/events/export");
    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toMatch(/text\/csv/);
    expect(res.text).toContain(
      `"eventType","timestamp","cameraId","confidence","priority","priorityLabel","location","severity","status","notes"`
    );
  });

  it("exports JSON on GET /api/events/export.json", async () => {
    await request(app).post("/api/event").send({
      eventType:    "fire",
      timestamp:    new Date().toISOString(),
      cameraId:     "CAM-03",
      confidence:   0.85,
      priorityLabel:"Medium",
      snapshotData: "data:image/png;base64,XYZ123==",
      eventDetails: { description: "Another fire" }
    });
    const res = await request(app).get("/api/events/export.json");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("priorityLabel", "Medium");
    expect(res.body[0]).toHaveProperty("confidence", 0.85);
  });
});
