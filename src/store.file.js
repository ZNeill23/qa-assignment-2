const fs = require("fs/promises");

function createFileStore(filePath) {
  return {
    async load() {
      try {
        const txt = await fs.readFile(filePath, "utf8");
        return JSON.parse(txt);
      } catch (err) {
        // If file is missing or invalid, start fresh
        return { events: [], registrations: [] };
      }
    },
    async save(db) {
      await fs.writeFile(filePath, JSON.stringify(db, null, 2), "utf8");
    },
  };
}

module.exports = { createFileStore };
