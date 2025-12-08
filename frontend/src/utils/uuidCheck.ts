// utils/uuidCheck.js
import { z } from "zod";

// strict RFC UUID (Zod's built-in)
export const isValidUuidStrict = (id: string) => {
  return z.uuid().safeParse(id).success;
};

// lenient: accept any 36-char hex-with-hyphens pattern (doesn't enforce version bits)
const lenientUuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isValidUuidLenient = (id: string) => {
  return typeof id === "string" && lenientUuidRegex.test(id);
};

// helper that returns zod error details (useful for debugging)
export const validateWithZod = (id: string) => {
  const result = z.uuid().safeParse(id);
  if (result.success) return { valid: true, errors: null };
  return { valid: false, errors: result.error.format() };
};
