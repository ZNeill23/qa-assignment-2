const { createApp } = require("../src/app");
const { createMemoryStore } = require("../src/store.memory");

describe("Unit tests", () => {
  test("rejects invalid email on registration", async () => {
    const app = createApp(createMemoryStore());
    const ev = await app.createEvent("Test", "2026-02-27");

    await expect(
      app.registerAttendee(ev.id, "not-an-email", "Zack"),
    ).rejects.toThrow("Invalid email");
  });

  test("prevents duplicate registration for same event", async () => {
    const app = createApp(createMemoryStore());
    const ev = await app.createEvent("Test", "2026-02-27");

    await app.registerAttendee(ev.id, "zack@test.com", "Zack");
    await expect(
      app.registerAttendee(ev.id, "zack@test.com", "Zack Again"),
    ).rejects.toThrow("Attendee already registered for this event");
  });

  test("check-in fails if attendee is not registered", async () => {
    const app = createApp(createMemoryStore());
    const ev = await app.createEvent("Test", "2026-02-27");

    await expect(app.checkIn(ev.id, "zack@test.com")).rejects.toThrow(
      "Registration not found for this event and email",
    );
  });

  test("check-in fails if already checked in", async () => {
    const app = createApp(createMemoryStore());
    const ev = await app.createEvent("Test", "2026-02-27");

    await app.registerAttendee(ev.id, "zack@test.com", "Zack");
    await app.checkIn(ev.id, "zack@test.com");

    await expect(app.checkIn(ev.id, "zack@test.com")).rejects.toThrow(
      "Attendee already checked in",
    );
  });

  test("report shows correct totals", async () => {
    const app = createApp(createMemoryStore());
    const ev = await app.createEvent("Test", "2026-02-27");

    await app.registerAttendee(ev.id, "a@test.com", "Attendee A");
    await app.registerAttendee(ev.id, "b@test.com", "Attendee B");
    await app.checkIn(ev.id, "b@test.com");

    const report = await app.getReport(ev.id);

    expect(report.eventName).toBe("Test");
    expect(report.totalRegistered).toBe(2);
    expect(report.totalCheckedIn).toBe(1);
    expect(report.checkedInAttendees).toEqual([
      { name: "Attendee B", email: "b@test.com" },
    ]);
  });
});
