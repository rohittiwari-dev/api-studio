"use client";

import type { Session, User } from "better-auth";
import { Sparkles } from "lucide-react";
import Image from "next/image";
import React from "react";
import ThemeSwitcher from "@/components/app-ui/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AskAiPanel } from "@/modules/ai/components/AskAiPanel";
import useAiStore, { isAiEnabled } from "@/modules/ai/store/ai.store";
import CloudSyncButton from "@/modules/apis/layout/components/CloudSyncButton";
import { PwaHeaderActions } from "@/modules/apis/layout/components/PwaHeaderActions";
import SearchPanel from "@/modules/apis/layout/components/Search-Panel";
import UserButton from "@/modules/authentication/components/user-button";
import { useAuthStore } from "@/modules/authentication/store";
import EnvironmentDropdown from "@/modules/workspace/components/EnvironmentDropdown";
import WorkspaceSwitcher from "@/modules/workspace/components/WorkspaceSwitcher";

const Header = ({
  currentUserSession,
}: {
  currentUserSession: { user: User | null; session: Session | null };
}) => {
  const { setAuthSession } = useAuthStore();
  const { toggleAiPanel } = useAiStore();
  const aiEnabled = isAiEnabled();

  React.useEffect(() => {
    if (currentUserSession) {
      setAuthSession(currentUserSession);
    }
  }, [currentUserSession, setAuthSession]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-(--header-height)">
        {/* Glass Background */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-white/5 dark:border-white/5 supports-backdrop-filter:bg-background/60" />

        {/* Subtle Gradient Line at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/50 to-transparent" />

        <div className="relative flex h-full items-center justify-between gap-2 px-3 sm:px-4">
          {/* Left Section — Brand + Workspace + Environment */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Logo */}
            <a
              href="/"
              className="group flex items-center gap-3 font-medium text-foreground transition-all duration-200 shrink-0"
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
            </a>

            {/* Divider */}
            <div className="h-4 w-px bg-border/40 hidden sm:block shrink-0" />

            {/* Workspace Switcher */}
            <div className="hidden sm:block min-w-0">
              <WorkspaceSwitcher />
            </div>

            {/* Environment Dropdown */}
            <div className="hidden md:block min-w-0">
              <EnvironmentDropdown />
            </div>

            {/* Cloud Sync */}
            <CloudSyncButton />
          </div>

          {/* Center Section — Search */}
          <div className="flex-1 flex justify-center max-w-md w-full mx-2">
            <SearchPanel />
          </div>

          {/* Right Section — Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* PWA install prompt + update notification */}
            <PwaHeaderActions />

            {/* Ask AI Button */}
            {aiEnabled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAiPanel}
                    className="h-8 px-2.5 gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 border border-violet-500/20 hover:border-violet-500/30 transition-all duration-200"
                  >
                    <Sparkles className="size-3.5" />
                    <span className="hidden sm:inline">Ask AI</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chat with AI for API help</TooltipContent>
              </Tooltip>
            )}

            {/* Theme Switcher */}
            <div className="hidden sm:flex items-center">
              <ThemeSwitcher variant="multiple" />
            </div>

            {/* Divider before user profile */}
            <div className="h-4 w-px bg-border/40 mx-0.5 hidden sm:block" />

            {/* User Profile */}
            <UserButton
              data={currentUserSession || undefined}
              variant={"header"}
            />
          </div>
        </div>
      </header>
      {aiEnabled && <AskAiPanel />}
    </>
  );
};

export default Header;
