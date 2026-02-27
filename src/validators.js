function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const e = email.trim();
  // Simple email check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function requireNonEmpty(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} is required`);
  }
  return value.trim();
}

module.exports = { isValidEmail, requireNonEmpty };
