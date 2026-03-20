"use client";

import { Loader2, LogOut, Monitor, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useRevokeAllSessionsMutation,
  useRevokeSessionMutation,
  useSessionsQuery,
} from "@/modules/authentication/hooks/use-security-query";
import { useAuthStore } from "@/modules/authentication/store";

export function SessionList() {
  const { data: authData } = useAuthStore();
  const { data: sessions, isLoading } = useSessionsQuery();
  const revokeMutation = useRevokeSessionMutation();
  const revokeAllMutation = useRevokeAllSessionsMutation();

  const parseUserAgent = (ua?: string | null) => {
    if (!ua) {
      return { browser: "Unknown", os: "Unknown" };
    }
    const browser = ua.includes("Chrome")
      ? "Chrome"
      : ua.includes("Firefox")
        ? "Firefox"
        : ua.includes("Safari")
          ? "Safari"
          : ua.includes("Edge")
            ? "Edge"
            : "Browser";
    const os = ua.includes("Windows")
      ? "Windows"
      : ua.includes("Mac")
        ? "macOS"
        : ua.includes("Linux")
          ? "Linux"
          : ua.includes("Android")
            ? "Android"
            : ua.includes("iOS")
              ? "iOS"
              : "Unknown";
    return { browser, os };
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Shield className="size-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-sm font-medium">Active Sessions</h3>
          <p className="text-xs text-muted-foreground">
            Manage devices where you&apos;re currently logged in
          </p>
        </div>
      </div>

      <div className="pl-11 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {sessions?.map((session) => {
              const isCurrentSession =
                session.token === authData?.session?.token;
              const { browser, os } = parseUserAgent(session.userAgent);

              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/40"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-2 rounded-full ${
                        isCurrentSession
                          ? "bg-emerald-500"
                          : "bg-muted-foreground/50"
                      }`}
                    />
                    <Monitor className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {os} • {browser}
                        {isCurrentSession && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[10px]"
                          >
                            Current
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.ipAddress || "Unknown IP"} • Started{" "}
                        {formatDate(session.createdAt)}
                      </p>
                    </div>
                  </div>
                  {!isCurrentSession && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                      onClick={() => revokeMutation.mutate(session.token)}
                      disabled={revokeMutation.isPending}
                    >
                      {revokeMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <LogOut className="size-4" />
                      )}
                    </Button>
                  )}
                </div>
              );
            })}

            {sessions && sessions.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                onClick={() => revokeAllMutation.mutate()}
                disabled={revokeAllMutation.isPending}
              >
                {revokeAllMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="size-4 mr-2" />
                )}
                Sign out all other sessions
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
