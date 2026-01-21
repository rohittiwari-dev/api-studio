import { RequestStateInterface } from "../types/request.types";

const COMPARABLE_FIELDS: (keyof RequestStateInterface)[] = [
  "name",
  "url",
  "method",
  "headers",
  "parameters",
  "body",
  "auth",
  "bodyType",
];

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a === "object") {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

/**
 * Check if a request has changes compared to its snapshot
 */
export function hasRequestChanges(
  current: RequestStateInterface,
  original: RequestStateInterface | undefined,
): boolean {
  if (!original) return true; // No snapshot = new request

  for (const field of COMPARABLE_FIELDS) {
    if (!deepEqual(current[field], original[field])) {
      return true;
    }
  }
  return false;
}
