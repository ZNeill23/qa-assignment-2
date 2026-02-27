const { isValidEmail, requireNonEmpty } = require("./validators");

function createApp(store) {
  function newId() {
    // Simple, unique id
    return Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  async function createEvent(name, date) {
    name = requireNonEmpty(name, "Event name");
    date = requireNonEmpty(date, "Event date");

    const db = await store.load();
    const event = { id: newId(), name, date };
    db.events.push(event);
    await store.save(db);

    return event;
  }

  async function registerAttendee(eventId, email, name) {
    eventId = requireNonEmpty(eventId, "Event ID");
    email = requireNonEmpty(email, "Email").toLowerCase();
    name = requireNonEmpty(name, "Attendee name");

    if (!isValidEmail(email)) throw new Error("Invalid email");

    const db = await store.load();

    const event = db.events.find((e) => e.id === eventId);
    if (!event) throw new Error("Event does not exist");

    const dup = db.registrations.find(
      (r) => r.eventId === eventId && r.email === email,
    );
    if (dup) throw new Error("Attendee already registered for this event");

    db.registrations.push({ eventId, email, name, checkedIn: false });
    await store.save(db);
  }

  async function checkIn(eventId, email) {
    eventId = requireNonEmpty(eventId, "Event ID");
    email = requireNonEmpty(email, "Email").toLowerCase();

    if (!isValidEmail(email)) throw new Error("Invalid email");

    const db = await store.load();

    const reg = db.registrations.find(
      (r) => r.eventId === eventId && r.email === email,
    );
    if (!reg)
      throw new Error("Registration not found for this event and email");

    if (reg.checkedIn) throw new Error("Attendee already checked in");

    reg.checkedIn = true;
    await store.save(db);
  }

  async function getReport(eventId) {
    eventId = requireNonEmpty(eventId, "Event ID");

    const db = await store.load();

    const event = db.events.find((e) => e.id === eventId);
    if (!event) throw new Error("Event does not exist");

    const regs = db.registrations.filter((r) => r.eventId === eventId);
    const checkedIn = regs.filter((r) => r.checkedIn);

    return {
      eventName: event.name,
      totalRegistered: regs.length,
      totalCheckedIn: checkedIn.length,
      checkedInAttendees: checkedIn.map((r) => ({
        name: r.name,
        email: r.email,
      })),
    };
  }

  return { createEvent, registerAttendee, checkIn, getReport };
}

module.exports = { createApp };
