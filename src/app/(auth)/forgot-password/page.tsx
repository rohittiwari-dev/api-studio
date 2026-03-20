"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { InputField } from "@/components/app-ui/inputs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import authClient from "@/lib/authClient";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/change-password",
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
        return;
      }

      setSentEmail(data.email);
      setIsEmailSent(true);
      toast.success("Password reset link sent!");
    } catch (_e) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setIsEmailSent(false);
    form.reset({ email: sentEmail });
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
            {isEmailSent ? "Check your email" : "Forgot password?"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEmailSent
              ? "We've sent a password reset link to your email"
              : "No worries, we'll send you reset instructions"}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEmailSent ? (
          /* Success State */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                We sent a password reset link to
              </p>
              <p className="font-medium">{sentEmail}</p>
            </div>

            <div className="w-full space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl"
                onClick={handleResend}
              >
                Didn&apos;t receive the email? Click to resend
              </Button>

              <Link href="/sign-in" className="block">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Form State */
          <motion.form
            key="form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <InputField
              id="email"
              label={<Label htmlFor="email">Email</Label>}
              type="email"
              leftIcon={<Mail className="w-4 h-4" />}
              placeholder="Enter your email address"
              className="rounded-xl bg-background/50"
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg shadow-primary/20 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Send Reset Link
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
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ForgotPasswordPage;
