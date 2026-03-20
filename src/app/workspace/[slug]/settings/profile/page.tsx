"use client";

import { motion } from "framer-motion";
import { Camera, Loader2, Mail, Save, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import authClient from "@/lib/authClient";
import { getInitialsFromName } from "@/lib/utils";
import Avatar from "@/modules/authentication/components/avatar";
import { useAuthStore } from "@/modules/authentication/store";

export default function ProfileSettingsPage() {
  const { data } = useAuthStore();
  const user = data?.user;

  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    await authClient.updateUser({
      name,
      fetchOptions: {
        onRequest: () => {
          setIsSaving(true);
        },
        onError(ctx) {
          toast.error(`Failed to update profile error: ${ctx.error?.message}`);
          setIsSaving(false);
        },
        onSuccess() {
          toast.success("Profile updated successfully");
          setIsSaving(false);
        },
        onResponse: () => {
          setIsSaving(false);
        },
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      <Separator />

      {/* Avatar Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Avatar</h3>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar
              className="size-20 rounded-2xl"
              fallbackClassName="rounded-2xl text-xl"
              href={user?.image || ""}
              alt={user?.name || ""}
              initial={getInitialsFromName(user?.name || "")}
            />
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="size-5 text-white" />
            </button>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Change avatar</p>
            <p className="text-xs text-muted-foreground">
              Click on the avatar to upload a custom image (Comming Soon...)
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Profile Form */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium">Personal Information</h3>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="pl-10 opacity-60"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </motion.div>
  );
}
