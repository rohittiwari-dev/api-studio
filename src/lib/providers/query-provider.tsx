"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";
import { createIDBPersister } from "./query-persister";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// Singleton persister — avoids re-creating on every render
const persister =
  typeof window !== "undefined" ? createIDBPersister() : undefined;

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data considered fresh for 5 minutes — no unnecessary re-fetches
            staleTime: 5 * 60 * 1000,
            // Keep data in cache for 7 days (must be >= maxAge for persistence)
            gcTime: SEVEN_DAYS,
            // Don't re-fetch when user switches back to the tab
            refetchOnWindowFocus: false,
            // Only retry once on failure to avoid hanging UI
            retry: 1,
          },
        },
      }),
  );

  // SSR fallback — no persistence on the server
  if (!persister) {
    return <>{children}</>;
  }

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: SEVEN_DAYS,
        // Only persist successful queries
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === "success",
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
