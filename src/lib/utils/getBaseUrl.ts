/**
 * A utility function to get the base URL of the current instance.
 * @returns The base URL.
 */
export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.WEB_PUBLIC_URL) {
    return `https://${process.env.WEB_PUBLIC_URL}`;
  }
  return `http://localhost:${String(process.env.PORT)}`;
}
