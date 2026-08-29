"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, LockIcon, Mail, User2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { IconGoogle } from "@/assets/app-icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import authClient from "@/lib/authClient";
import {
  signInFormSchema,
  signUpFormSchema,
} from "@/lib/form-schemas/auth-forms";
import { cn } from "@/lib/utils";
import useWorkspaceState from "@/modules/workspace/store";
import { InputField } from "../../../components/app-ui/inputs";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";

type Props = {
  type?: "sign-in" | "sign-up";
  className?: string;
  content_flow?: "right" | "left";
  image_src?: string;
  image_alt?: string;
};

const AuthForm = ({ type = "sign-in", className }: Props) => {
  const [rememberMe, setRememberMe] = useState(false);
  const [isTwoFactor, setIsTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState({
    googleAuthLoading: false,
    emailSigninLoading: false,
  });
  const { activeWorkspace } = useWorkspaceState();

  const form = useForm<
    z.infer<typeof signUpFormSchema> | z.infer<typeof signInFormSchema>
  >({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    resolver: zodResolver(
      type === "sign-up" ? signUpFormSchema : signInFormSchema,
    ),
    mode: "onChange",
  });

  const handleTwoFactorVerify = async () => {
    if (twoFactorCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading((prev) => ({ ...prev, emailSigninLoading: true }));
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: twoFactorCode,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Successfully logged in");
      router.push("/workspace/get-started");
    } catch (_e) {
      toast.error("Failed to verify code");
    } finally {
      setLoading((prev) => ({ ...prev, emailSigninLoading: false }));
    }
  };

  const handleBackupCodeVerify = async () => {
    if (!twoFactorCode) {
      toast.error("Please enter a backup code");
      return;
    }

    setLoading((prev) => ({ ...prev, emailSigninLoading: true }));
    try {
      const { error } = await authClient.twoFactor.verifyBackupCode({
        code: twoFactorCode,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Successfully logged in", {
        description:
          "You will be redirected to your workspace, you used backup code please Reset your credentials immediately",
        action:
          (activeWorkspace?.slug && {
            label: "Reset Credentials",
            onClick: () => {
              router.push(
                `/workspace/${activeWorkspace?.slug}/settings/security`,
              );
            },
          }) ||
          undefined,
      });
      router.push("/workspace/get-started");
    } catch (_e) {
      toast.error("Failed to verify backup code");
    } finally {
      setLoading((prev) => ({ ...prev, emailSigninLoading: false }));
    }
  };

  const handleSubmit = async (
    data: z.infer<typeof signUpFormSchema> | z.infer<typeof signInFormSchema>,
  ) => {
    if (type === "sign-up") {
      return await authClient.signUp.email(
        {
          email: data.email,
          password: data.password,
          name: (data as z.infer<typeof signUpFormSchema>).name,
          callbackURL: "/workspace/get-started",
        },
        {
          onRequest: () => {
            setLoading((prev) => ({
              ...prev,
              emailSigninLoading: true,
            }));
          },
          onSuccess: () => {
            toast.success("Successfully Signed Up");
            router.push("/workspace/get-started");
          },
          onError: (ctx) => {
            console.log(ctx);
            toast.error(ctx.error.message);
          },
          onResponse: () => {
            setLoading((prev) => ({
              ...prev,
              emailSigninLoading: false,
            }));
          },
        },
      );
    } else {
      return await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
          rememberMe: rememberMe,
          callbackURL: "/workspace/get-started",
        },
        {
          onRequest: () => {
            setLoading((prev) => ({
              ...prev,
              emailSigninLoading: true,
            }));
          },
          onSuccess: (ctx) => {
            if (ctx.data.twoFactorRedirect) {
              setIsTwoFactor(true);
              setLoading((prev) => ({
                ...prev,
                emailSigninLoading: false,
              })); // stop loading to show input
              return;
            }
            toast.success("Successfully logged in");
            router.push("/workspace/get-started");
          },
          onError: (ctx) => {
            console.log(ctx);
            toast.error(ctx.error.message);
            setLoading((prev) => ({
              ...prev,
              emailSigninLoading: false,
            }));
          },
        },
      );
    }
  };

  const handleGoogleLoginAndSignup = async () => {
    await authClient.signIn.social({
      provider: "google",
      requestSignUp: type === "sign-up",
      callbackURL: "/workspace/get-started",
      errorCallbackURL: type === "sign-up" ? `/sign-up` : `/sign-in`,
      fetchOptions: {
        onRequest(_context) {
          setLoading((prev) => ({
            ...prev,
            googleAuthLoading: true,
          }));
        },
        onSuccess(_context) {
          toast.success("Redirecting to signup....");
        },
        onError(context) {
          console.log(context);
          toast.error(context.error.message);
        },
        onResponse(_context) {
          setLoading((prev) => ({
            ...prev,
            googleAuthLoading: false,
          }));
        },
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative w-full rounded-2xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden p-6 sm:p-8",
        className,
      )}
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-6 mb-8">
        <Link href="/" className="group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="relative w-12 h-12"
          >
            <Image
              src="/logo.png"
              alt="Api Studio"
              fill
              className="object-contain"
            />
          </motion.div>
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {isTwoFactor
              ? "Two-Factor Authentication"
              : type === "sign-in"
                ? "Welcome back"
                : "Create an account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isTwoFactor
              ? "Enter the code from your authenticator app"
              : type === "sign-in"
                ? "Enter your credentials to access your workspace"
                : "Enter your details to get started for free"}
          </p>
        </div>
      </div>

      {isTwoFactor ? (
        <Tabs defaultValue="totp" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="totp">Authenticator</TabsTrigger>
            <TabsTrigger value="backup">Backup Code</TabsTrigger>
          </TabsList>

          <TabsContent value="totp" className="space-y-4">
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 pl-10 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center font-mono tracking-widest text-lg"
                  placeholder="000000"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) =>
                    setTwoFactorCode(e.target.value.replace(/\D/g, ""))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && twoFactorCode.length === 6) {
                      handleTwoFactorVerify();
                    }
                  }}
                />
              </div>
            </div>
            <Button
              type="button"
              className="w-full h-11 rounded-xl"
              onClick={handleTwoFactorVerify}
              disabled={
                loading.emailSigninLoading || twoFactorCode.length !== 6
              }
            >
              {loading.emailSigninLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <div className="space-y-2">
              <Label>Backup Code</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-3 pl-10 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center font-mono tracking-widest text-lg"
                  placeholder="XXXX-XXXX"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && twoFactorCode.length > 0) {
                      handleBackupCodeVerify();
                    }
                  }}
                />
              </div>
            </div>
            <Button
              type="button"
              className="w-full h-11 rounded-xl"
              onClick={handleBackupCodeVerify}
              disabled={loading.emailSigninLoading || !twoFactorCode}
            >
              {loading.emailSigninLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Verify Backup Code"
              )}
            </Button>
          </TabsContent>

          <Button
            type="button"
            variant="ghost"
            className="w-full mt-2"
            onClick={() => {
              setIsTwoFactor(false);
              setTwoFactorCode("");
            }}
          >
            Back to Login
          </Button>
        </Tabs>
      ) : (
        /* Form */
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          {/* Google Button */}
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl bg-background/50 border-input hover:bg-accent hover:text-accent-foreground transition-all"
            type="button"
            onClick={handleGoogleLoginAndSignup}
            disabled={loading.googleAuthLoading || loading.emailSigninLoading}
          >
            {loading.googleAuthLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <IconGoogle className="mr-2 h-4 w-4" />
            )}
            Continue with Google
          </Button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            <AnimatePresence mode="wait">
              {type === "sign-up" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <InputField
                    id="name"
                    label={<Label htmlFor="name">Full Name</Label>}
                    type="text"
                    leftIcon={<User2 className="w-4 h-4" />}
                    placeholder="John Doe"
                    className="rounded-xl bg-background/50"
                    error={(form.formState.errors as any).name?.message}
                    {...form.register("name")}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField
              id="email"
              label={<Label htmlFor="email">Email</Label>}
              type="email"
              leftIcon={<Mail className="w-4 h-4" />}
              placeholder="details@example.com"
              className="rounded-xl bg-background/50"
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />

            <div className="space-y-1">
              <InputField
                id="password"
                label={
                  <div className="flex items-center justify-between w-full">
                    <Label htmlFor="password">Password</Label>
                    {type === "sign-in" && (
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                }
                type="password"
                leftIcon={<LockIcon className="w-4 h-4" />}
                placeholder="••••••••"
                className="rounded-xl bg-background/50"
                error={form.formState.errors.password?.message}
                {...form.register("password")}
              />
            </div>

            {type === "sign-in" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me for 30 days
                </Label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg shadow-primary/20 mt-2"
              disabled={loading.googleAuthLoading || loading.emailSigninLoading}
            >
              {loading.emailSigninLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  {type === "sign-in" ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Footer */}
      {!isTwoFactor && (
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {type === "sign-in"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <Link
            href={type === "sign-in" ? "/sign-up" : "/sign-in"}
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            {type === "sign-in" ? "Sign up" : "Sign in"}
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default AuthForm;
