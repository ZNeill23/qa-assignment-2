const path = require("path");
const fs = require("fs/promises");
const { createApp } = require("../src/app");
const { createFileStore } = require("../src/store.file");

describe("Integration tests", () => {
  const testFile = path.join(__dirname, "test-data.json");

  beforeEach(async () => {
    // start clean each test
    await fs.writeFile(
      testFile,
      JSON.stringify({ events: [], registrations: [] }, null, 2),
    );
  });

  afterAll(async () => {
    // cleanup
    try {
      await fs.unlink(testFile);
    } catch {}
  });

  test("register attendee -> stored -> report sees it", async () => {
    const app = createApp(createFileStore(testFile));
    const ev = await app.createEvent("Integration", "2026-02-27");

    await app.registerAttendee(ev.id, "zack@test.com", "Zack");

    const report = await app.getReport(ev.id);
    expect(report.totalRegistered).toBe(1);
    expect(report.checkedInAttendees.length).toBe(0);
  });

  test("register + check-in -> report reflects checked-in", async () => {
    const app = createApp(createFileStore(testFile));
    const ev = await app.createEvent("Integration", "2026-02-27");

    await app.registerAttendee(ev.id, "a@test.com", "Attendee A");
    await app.checkIn(ev.id, "a@test.com");

    const report = await app.getReport(ev.id);
    expect(report.totalRegistered).toBe(1);
    expect(report.totalCheckedIn).toBe(1);
  });

  test("full workflow multiple attendees", async () => {
    const app = createApp(createFileStore(testFile));
    const ev = await app.createEvent("Integration", "2026-02-27");

    await app.registerAttendee(ev.id, "one@test.com", "Attendee One");
    await app.registerAttendee(ev.id, "two@test.com", "Attendee Two");
    await app.checkIn(ev.id, "two@test.com");

    const report = await app.getReport(ev.id);
    expect(report.totalRegistered).toBe(2);
    expect(report.totalCheckedIn).toBe(1);
    expect(report.checkedInAttendees.map((x) => x.email)).toEqual([
      "two@test.com",
    ]);
  });
});
