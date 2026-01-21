import { RequestStateInterface } from "../types/request.types";

/**
 * Fields to compare for detecting unsaved changes
 */
const COMPARABLE_FIELDS: (keyof RequestStateInterface)[] = [
  "name",
  "url",
  "method",
  "headers",
  "parameters",
  "body",
  "auth",
  "bodyType",
  "savedMessages",
];

/**
 * Deep compare two values
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;

  if (typeof a === "object") {
    const aStr = JSON.stringify(a);
    const bStr = JSON.stringify(b);
    return aStr === bStr;
  }

  return false;
}

/**
 * Check if a request has changes compared to its original state
 * @param current - Current request state
 * @param original - Original request state (snapshot)
 * @returns true if there are unsaved changes
 */
export function hasRequestChanges(
  current: RequestStateInterface,
  original: RequestStateInterface | undefined,
): boolean {
  // NEW requests are always considered changed
  if (current.type === "NEW") return true;

  // If no original, can't compare
  if (!original) return false;

  // Compare each field
  for (const field of COMPARABLE_FIELDS) {
    if (!deepEqual(current[field], original[field])) {
      return true;
    }
  }

  return false;
}

/**
 * Get list of fields that have changed
 * @param current - Current request state
 * @param original - Original request state
 * @returns Array of field names that changed
 */
export function getChangedFields(
  current: RequestStateInterface,
  original: RequestStateInterface | undefined,
): string[] {
  if (!original) return [];

  const changedFields: string[] = [];

  for (const field of COMPARABLE_FIELDS) {
    if (!deepEqual(current[field], original[field])) {
      changedFields.push(field);
    }
  }

  return changedFields;
}

/**
 * Create a clean copy of request for comparison (only comparable fields)
 */
export function getComparableRequest(
  request: RequestStateInterface,
): Partial<RequestStateInterface> {
  const result: Partial<RequestStateInterface> = {};

  for (const field of COMPARABLE_FIELDS) {
    (result as any)[field] = request[field];
  }

  return result;
}

/**
 * Check if any requests in a list have unsaved changes
 */
export function hasAnyUnsavedChanges(
  requests: RequestStateInterface[],
  getSnapshot: (id: string) => RequestStateInterface | undefined,
): boolean {
  return requests.some((req) => {
    if (req.type === "NEW") return true;
    const snapshot = getSnapshot(req.id);
    return hasRequestChanges(req, snapshot);
  });
}

/**
 * Get all requests with unsaved changes
 */
export function getUnsavedRequests(
  requests: RequestStateInterface[],
  getSnapshot: (id: string) => RequestStateInterface | undefined,
): RequestStateInterface[] {
  return requests.filter((req) => {
    if (req.type === "NEW") return true;
    const snapshot = getSnapshot(req.id);
    return hasRequestChanges(req, snapshot);
  });
}
