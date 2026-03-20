import {
  lastLoginMethodClient,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import env from "@/lib/env";

const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_WEB_PUBLIC_URL,
  plugins: [
    lastLoginMethodClient(),
    twoFactorClient(),
    organizationClient({
      schema: {
        organization: {
          additionalFields: {
            globalAuth: {
              type: "json",
              defaultValue: {},
            },
          },
        },
      },
    }),
  ],
});

export default authClient;
