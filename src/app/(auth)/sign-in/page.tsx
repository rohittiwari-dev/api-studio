import { Suspense } from "react";
import { AuthErrorHandler } from "@/modules/authentication/components/auth-error-handler";
import AuthForm from "@/modules/authentication/components/auth-form";

/**
 * `searchParams` is deliberately not read here. The only thing it drives is the
 * OAuth error toast, which `<AuthErrorHandler>` owns behind its own boundary,
 * so the whole form lands in the static shell and the route is instant.
 */
const SignInPage = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <AuthErrorHandler />
      </Suspense>
      <AuthForm type="sign-in" />
    </div>
  );
};

export default SignInPage;
