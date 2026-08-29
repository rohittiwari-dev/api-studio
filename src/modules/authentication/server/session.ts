import { cache } from "react";
import { currentUser } from "./auth.actions";

/**
 * Request-deduped wrapper around {@link currentUser}.
 *
 * Under Cache Components the session read gets pushed down into several
 * sibling `<Suspense>` boundaries (header, store hydrators, page content) so
 * the surrounding layout stays prerenderable. Each of those would otherwise
 * repeat the `headers()` -> `getSession()` -> user lookup round trip.
 * React's `cache()` collapses them into a single call per request.
 *
 * `auth.actions.ts` is a `"use server"` module, so it can only export async
 * functions -- the memoization has to live here.
 */
export const getCurrentUser = cache(currentUser);
