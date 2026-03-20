"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockIcon,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { InputField } from "@/components/app-ui/inputs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import authClient from "@/lib/authClient";

const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

type PageState = "loading" | "form" | "success" | "error";

function ChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const form = useForm<ChangePasswordFormData>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (error === "INVALID_TOKEN" || error === "invalid_token") {
      setErrorMessage("This password reset link is invalid or has expired.");
      setPageState("error");
    } else if (!token) {
      setErrorMessage(
        "No reset token provided. Please request a new password reset link.",
      );
      setPageState("error");
    } else {
      setPageState("form");
    }
  }, [token, error]);

  const handleSubmit = async (data: ChangePasswordFormData) => {
    if (!token) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.newPassword,
        token: token,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
        return;
      }

      setPageState("success");
      toast.success("Password reset successfully!");

      // Redirect to sign-in after a short delay
      setTimeout(() => {
        router.push("/sign-in");
      }, 3000);
    } catch (_e) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (pageState) {
      case "loading":
        return (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Validating reset link...
            </p>
          </motion.div>
        );

      case "error":
        return (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">Link Expired</h2>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>

            <Link href="/forgot-password" className="w-full">
              <Button type="button" className="w-full h-11 rounded-xl">
                Request New Reset Link
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/sign-in">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </motion.div>
        );

      case "success":
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">Password Reset!</h2>
              <p className="text-sm text-muted-foreground">
                Your password has been successfully reset. Redirecting to sign
                in...
              </p>
            </div>

            <Link href="/sign-in" className="w-full">
              <Button type="button" className="w-full h-11 rounded-xl">
                Continue to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        );

      case "form":
        return (
          <motion.form
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <InputField
              id="newPassword"
              label={<Label htmlFor="newPassword">New Password</Label>}
              type="password"
              leftIcon={<LockIcon className="w-4 h-4" />}
              placeholder="Enter your new password"
              className="rounded-xl bg-background/50"
              error={form.formState.errors.newPassword?.message}
              {...form.register("newPassword")}
            />

            <InputField
              id="confirmPassword"
              label={<Label htmlFor="confirmPassword">Confirm Password</Label>}
              type="password"
              leftIcon={<LockIcon className="w-4 h-4" />}
              placeholder="Confirm your new password"
              className="rounded-xl bg-background/50"
              error={form.formState.errors.confirmPassword?.message}
              {...form.register("confirmPassword")}
            />

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg shadow-primary/20 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <Link href="/sign-in" className="block mt-2">
              <Button
                type="button"
                variant="ghost"
                className="w-full h-11 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Button>
            </Link>
          </motion.form>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full rounded-2xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden p-6 sm:p-8"
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
            {pageState === "success"
              ? "All done!"
              : pageState === "error"
                ? "Something went wrong"
                : "Reset your password"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {pageState === "form" && "Enter your new password below"}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </motion.div>
  );
}

const ChangePasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <ChangePasswordContent />
    </Suspense>
  );
};

export default ChangePasswordPage;
