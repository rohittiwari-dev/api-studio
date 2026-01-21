"use client";

import React from "react";
import Image from "next/image";
import { Session, User } from "better-auth";
import ThemeSwitcher from "@/components/app-ui/theme-switcher";
import UserButton from "@/modules/authentication/components/user-button";
import { useAuthStore } from "@/modules/authentication/store";
import WorkspaceSwitcher from "@/modules/workspace/components/WorkspaceSwitcher";

const WorkspaceDashboardHeader = ({
  currentUserSession,
}: {
  currentUserSession: { user: User | null; session: Session | null };
}) => {
  const { setAuthSession } = useAuthStore();

  React.useEffect(() => {
    if (currentUserSession) {
      setAuthSession(currentUserSession);
    }
  }, [currentUserSession, setAuthSession]);

  return (
    <header className="sticky top-0 z-50 w-full h-[60px]">
      {/* Glass Background */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-white/5 dark:border-white/5 supports-backdrop-filter:bg-background/60" />

      {/* Subtle Gradient Line at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/50 to-transparent" />

      <div className="relative flex h-full items-center justify-between gap-4 px-4">
        {/* Left Section - Brand & Navigation */}
        <div className="flex flex-1 justify-start items-center gap-4">
          {/* Logo */}
          <a
            href="#"
            className="group flex items-center gap-3 font-medium text-foreground transition-all duration-200"
          >
            <div className="relative flex items-center justify-center size-8 rounded-xl bg-linear-to-br from-violet-500/10 via-indigo-500/10 to-transparent border border-white/10 shadow-sm group-hover:shadow-violet-500/10 group-hover:border-violet-500/20 transition-all duration-300">
              <Image
                src="/logo.png"
                alt="Api Studio"
                width={100}
                height={100}
                priority
                className="relative w-4.5 h-4.5 object-contain opacity-90"
              />
            </div>
            <span className="hidden sm:inline-block text-sm font-semibold tracking-wide bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Api Studio
            </span>
          </a>

          {/* Divider */}
          <div className="h-4 w-px bg-border/40 mx-1 hidden sm:block" />

          {/* Workspace Switcher */}
          <div className="hidden sm:block">
            <WorkspaceSwitcher />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center flex-1 justify-end gap-2">
          {/* Theme Switcher */}
          <div className="hidden sm:flex items-center">
            <ThemeSwitcher variant="multiple" />
          </div>

          <div className="h-4 w-px bg-border/40 mx-1 hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center pl-1">
            <UserButton data={currentUserSession!} variant={"header"} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default WorkspaceDashboardHeader;
