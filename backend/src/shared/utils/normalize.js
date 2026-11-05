export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function toNullable(value) {
  return value === undefined || value === '' ? null : value;
}
