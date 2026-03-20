import type React from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/lib/providers/theme.provider";
import { currentUser } from "@/modules/authentication/server/auth.actions";
import AuthProvider from "@/modules/authentication/store/AuthProvider";
import { QueryProvider } from "./query-provider";

const SystemProviders = async ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const currentUserSession = await currentUser();
  return (
    <QueryProvider>
      <AuthProvider
        state={{
          data: {
            session: currentUserSession?.session || null,
            user: currentUserSession?.user || null,
          },
        }}
      >
        <ThemeProvider>
          <Toaster />
          {children}
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
};

export default SystemProviders;
