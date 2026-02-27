function createMemoryStore() {
  const db = {
    events: [], // { id, name, data }
    registrations: [], // { eventId, email, name, checkedIn }
  };

  return {
    async load() {
      return structuredClone(db);
    },
    async save(newDb) {
      db.events = newDb.events;
      db.registrations = newDb.registrations;
    },
  };
}

module.exports = { createMemoryStore };
