"use client";

import type { Session, User } from "better-auth";
import { Building2, LogOut, User as UserIcon, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Spinner from "@/components/app-ui/spinner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import authClient from "@/lib/authClient";
import { cn, getInitialsFromName } from "@/lib/utils";
import useCookieStore from "@/modules/apis/cookies/store/cookie.store";
import Avatar from "@/modules/authentication/components/avatar";
import { useAuthStore } from "@/modules/authentication/store";
import useWorkspaceState from "@/modules/workspace/store";

const LogoutMenuItem = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthSession } = useAuthStore();
  const { clearCookies } = useCookieStore();
  return (
    <DropdownMenuItem
      onClick={async () => {
        setLoading(true);
        await authClient?.signOut({
          fetchOptions: {
            onRequest: () => {
              setLoading(true);
            },
            onSuccess: () => {
              setLoading(false);
              setAuthSession({
                session: null,
                user: null,
              });
              clearCookies();
              // clear cookies for auth
              // biome-ignore lint/suspicious/noDocumentCookie: Required for client-side Auth cookie removal fallback
              document.cookie =
                "better-auth.session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              // biome-ignore lint/suspicious/noDocumentCookie: Required for client-side Auth cookie removal fallback
              document.cookie =
                "__Secure-better-auth.session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              redirect("/sign-in");
            },
            onError: () => {
              setLoading(false);
            },
          },
        });
      }}
      className="p-1.5 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-500/10 dark:focus:bg-red-500/10 mt-1"
    >
      <div className="flex items-center justify-center size-7 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 mr-2 group-hover:bg-red-500/20 transition-colors">
        {loading ? (
          <Spinner className="size-3.5" />
        ) : (
          <LogOut className="size-3.5" />
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">Log out</span>
        <span className="text-[11px] text-muted-foreground">
          End your session
        </span>
      </div>
    </DropdownMenuItem>
  );
};

function UserButton({
  data,
  variant = "sidebar",
  dropdownContentAlign = "bottom",
}: {
  data?: { user: User | null; session: Session | null };
  variant?: "sidebar" | "header";
  dropdownContentAlign?: "bottom" | "right" | "top" | "left" | undefined;
}) {
  const { setAuthSession, data: stateData } = useAuthStore();
  const { activeWorkspace } = useWorkspaceState();
  const { email, name, image } = stateData?.user || data?.user || {};
  const workspaceSlug = activeWorkspace?.slug || "";

  useEffect(() => {
    if (data && !stateData) {
      setAuthSession(data);
    }
  }, [data, setAuthSession, stateData]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="outline-none">
        <Button
          type="button"
          size="lg"
          variant={variant === "header" ? "outline" : "ghost"}
          className={cn(
            "w-full cursor-pointer px-2 select-none gap-3 hover:bg-accent/50 transition-colors",
            variant === "header" &&
              "bg-secondary/50! hover:bg-accent/90 h-fit w-fit rounded-full p-1 pr-3 border-transparent",
          )}
        >
          <Avatar
            className={cn(
              "h-9 w-9 border border-border/50",
              variant === "sidebar" && "rounded-xl",
            )}
            fallbackClassName={cn(
              "h-9 w-9",
              variant === "sidebar" && "rounded-xl",
            )}
            href={image || ""}
            alt={name}
            initial={getInitialsFromName(name || "")}
          />
          {variant === "sidebar" && (
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-semibold text-sm">{name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {email}
              </span>
            </div>
          )}
          {variant === "header" && (
            <span className="truncate font-semibold text-sm mr-1">{name}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[260px] rounded-2xl p-1.5 border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl"
        side={dropdownContentAlign}
        align="end"
        sideOffset={8}
      >
        <div className="p-1.5 mb-1.5 rounded-xl bg-background/40! border border-border/40">
          <div className="flex items-center gap-3">
            <Avatar
              className="h-9 w-9 rounded-xl border border-border/50 bg-background/40! shadow-sm"
              fallbackClassName="rounded-xl"
              href={image || ""}
              alt={name}
              initial={getInitialsFromName(name || "")}
            />
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-semibold text-foreground text-sm">
                {name}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {email}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuItem
            className="p-1.5 cursor-pointer focus:bg-accent/50 rounded-lg group"
            asChild
          >
            <Link
              href={`/workspace/${workspaceSlug}/settings/profile`}
              className="flex items-center w-full"
            >
              <div className="flex items-center justify-center size-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 mr-2 group-hover:bg-blue-500/20 transition-colors">
                <UserIcon className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Profile</span>
                <span className="text-[11px] text-muted-foreground">
                  Manage your account
                </span>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="p-1.5 cursor-pointer focus:bg-accent/50 rounded-lg group"
            asChild
          >
            <Link
              href={`/workspace/${workspaceSlug}/settings/workspace`}
              className="flex items-center w-full"
            >
              <div className="flex items-center justify-center size-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 mr-2 group-hover:bg-orange-500/20 transition-colors">
                <Building2 className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Workspace</span>
                <span className="text-[11px] text-muted-foreground">
                  Preferences & settings
                </span>
              </div>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="p-1.5 cursor-pointer focus:bg-accent/50 rounded-lg group"
            asChild
          >
            <Link
              href={`/workspace/${workspaceSlug}/settings/team`}
              className="flex items-center w-full"
            >
              <div className="flex items-center justify-center size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mr-2 group-hover:bg-emerald-500/20 transition-colors">
                <Users className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Team</span>
                <span className="text-[11px] text-muted-foreground">
                  Manage members
                </span>
              </div>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1.5 bg-border/50" />

        <LogoutMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;
