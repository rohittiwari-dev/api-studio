"use client";

import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { LinkedAccounts } from "@/modules/authentication/components/linked-accounts";
import { PasswordChangeSection } from "@/modules/authentication/components/password-change-section";
import { SessionList } from "@/modules/authentication/components/session-list";
import { TwoFactorSetup } from "@/modules/authentication/components/two-factor-setup";

export default function SecuritySettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Security</h2>
        <p className="text-muted-foreground mt-1">
          Manage your password, two-factor authentication, and sessions
        </p>
      </div>

      <Separator />

      {/* Change Password */}
      <PasswordChangeSection />

      <Separator />

      {/* Linked Accounts */}
      <LinkedAccounts />

      <Separator />

      {/* Two-Factor Authentication */}
      <TwoFactorSetup />

      <Separator />

      {/* Active Sessions */}
      <SessionList />
    </motion.div>
  );
}
