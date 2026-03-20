"use client";

import {
  Building2,
  ChevronLeft,
  Layers,
  Loader2,
  LogOut,
  MailPlus,
  Shield,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { APP_VERSION } from "@/constants";
import authClient from "@/lib/authClient";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/modules/authentication/store";
import useWorkspaceState from "@/modules/workspace/store";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const navItems = (slug: string) => [
  {
    title: "Profile",
    href: `/workspace/${slug}/settings/profile`,
    icon: User,
    description: "Manage your personal information",
  },
  {
    title: "Your Invitations",
    href: `/workspace/${slug}/settings/invitations`,
    icon: MailPlus,
    description: "Manage your invitations",
  },
  {
    title: "Security",
    href: `/workspace/${slug}/settings/security`,
    icon: Shield,
    description: "Password and authentication",
  },
  {
    title: "Current Workspace",
    href: `/workspace/${slug}/settings/workspace`,
    icon: Building2,
    description: "Configure workspace settings",
  },
  {
    title: "All Workspaces",
    href: `/workspace/${slug}/settings/workspaces`,
    icon: Layers,
    description: "Manage all your workspaces",
  },
  {
    title: "Team",
    href: `/workspace/${slug}/settings/team`,
    icon: Users,
    description: "Manage team members and roles",
  },
];

function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const { setAuthSession } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setAuthSession({ session: null, user: null });
          // biome-ignore lint/suspicious/noDocumentCookie: Required for client-side Auth cookie removal fallback
          document.cookie =
            "better-auth.session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          // biome-ignore lint/suspicious/noDocumentCookie: Required for client-side Auth cookie removal fallback
          document.cookie =
            "__Secure-better-auth.session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          router.push("/sign-in");
        },
        onError: () => {
          setLoading(false);
        },
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      Log out
    </button>
  );
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const { activeWorkspace } = useWorkspaceState();
  const slug = activeWorkspace?.slug || "";

  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="relative flex h-full">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border/40 bg-background/60 backdrop-blur-xl flex flex-col h-full shrink-0">
          <div className="flex flex-col h-full overflow-y-auto p-6">
            {/* Back Button */}
            <Link href={slug ? `/workspace/${slug}` : "/workspace"}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-6 -ml-2 gap-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="size-4" />
                Back to Workspace
              </Button>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your account and preferences
              </p>
            </div>

            {activeWorkspace && (
              <div className="mb-6 relative group">
                <div className="relative p-3 rounded-xl border border-border/50 bg-background/80 backdrop-blur-sm hover:border-primary/30 transition-all duration-300">
                  {/* Active indicator dot */}
                  <div className="absolute top-2.5 right-2.5 size-1.5 rounded-full bg-emerald-500" />

                  <div className="flex items-center gap-3">
                    {/* Logo */}
                    <div className="size-9 rounded-lg bg-linear-to-br from-primary/20 via-violet-500/15 to-blue-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                      {activeWorkspace.logo ? (
                        <Image
                          src={activeWorkspace.logo}
                          alt={activeWorkspace.name}
                          width={36}
                          height={36}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-primary">
                          {activeWorkspace.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activeWorkspace.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 truncate">
                        /{activeWorkspace.slug}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
              {navItems(slug).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      "text-sm font-medium",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="pt-6 mt-auto border-t border-border/40 space-y-3">
              <LogoutButton />
              <p className="text-xs text-muted-foreground/60">
                Api Studio v{APP_VERSION}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-full overflow-y-auto">
          <div className="p-8 max-w-3xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
