import type React from "react";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/providers/theme.provider";
import { getCurrentUser } from "@/modules/authentication/server/session";
import AuthProvider from "@/modules/authentication/store/AuthProvider";
import { QueryProvider } from "./query-provider";

/**
 * Seeds the auth store with the server session.
 *
 * This is the only part of the provider tree that needs runtime data, so it
 * lives behind its own `<Suspense>` boundary. Awaiting it here instead of in
 * `SystemProviders` is what keeps every route prerenderable: previously the
 * `headers()` read sat above the entire app, so nothing below it could reach
 * the static shell and no navigation could be instant.
 *
 * `AuthProvider` also runs `authClient.useSession()` client side, so this is a
 * hydration head start rather than the only source of session state.
 */
const AuthStateHydrator = async () => {
  const currentUserSession = await getCurrentUser();

  return (
    <AuthProvider
      state={{
        data: {
          session: currentUserSession?.session || null,
          user: currentUserSession?.user || null,
        },
      }}
    />
  );
};

const SystemProviders = ({ children }: { children?: React.ReactNode }) => {
  return (
    <QueryProvider>
      <ThemeProvider>
        <Toaster />
        <Suspense fallback={null}>
          <AuthStateHydrator />
        </Suspense>
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
};

export default SystemProviders;
