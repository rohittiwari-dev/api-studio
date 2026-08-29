"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Handles the OAuth `?error=` callback on the auth pages.
 *
 * These values only ever drive a toast and a redirect -- they render nothing --
 * so they're read here rather than in the page. That keeps `<AuthForm>` free of
 * URL data and fully inside the static shell, so /sign-in and /sign-up navigate
 * instantly instead of blocking on `searchParams`.
 *
 * `useSearchParams` suspends during prerendering, so this must stay inside a
 * `<Suspense>` boundary.
 *
 * @see https://nextjs.org/docs/messages/instant-shell-url-data
 */
export function AuthErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  useEffect(() => {
    if (error === "signup_disabled" || errorDescription === "signup_disabled") {
      toast.error("You don't have an account, please sign up");
      router.push("/sign-up");
    }
  }, [error, errorDescription, router]);

  return null;
}
