"use client";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { RequestIcon } from "@/modules/apis/requests/components/RequestType";
import { SidebarRequestMenu } from "@/modules/apis/requests/components/SidebarRequestMenu";
import { SidebarItemInterface } from "@/modules/apis/collections/types/sidebar.types";
import { RequestType } from "@/generated/prisma/browser";
import useRequestSyncStoreState from "@/modules/apis/requests/hooks/requestSyncStore";

interface SidebarFileProps {
  item: SidebarItemInterface;
  isActive?: boolean;
  isUnsaved?: boolean;
}

export function SidebarFile({ item, isActive, isUnsaved }: SidebarFileProps) {
  const { requests, openRequest } = useRequestSyncStoreState();

  const currentRequest = {
    ...item,
    ...(requests.find((req) => req.id === item.id) || {}),
  };

  const method = currentRequest?.method || "GET";

  // Explicitly handle unsaved state passed from parent or derived
  const unsaved = isUnsaved ?? currentRequest?.unsaved;

  const methodBgMap: Record<string, string> = {
    GET: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    POST: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    PUT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    PATCH:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    DELETE:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };
  const methodBg =
    methodBgMap[method] || "bg-muted text-muted-foreground border-border";

  return (
    <SidebarMenuButton
      isActive={isActive}
      onClick={() => {
        openRequest({
          auth: currentRequest.auth || { type: "NONE" },
          body: currentRequest.body || {
            raw: "",
            formData: [],
            urlEncoded: [],
            file: null,
            json: {},
          },
          createdAt: currentRequest.createdAt || new Date(),
          updatedAt: currentRequest.updatedAt || new Date(),
          description: currentRequest.description || "",
          headers: currentRequest.headers || [],
          id: item.id,
          unsaved: currentRequest.unsaved ?? true,
          method: currentRequest.method || "GET",
          name: currentRequest.name || "New Request",
          parameters: currentRequest.parameters || [],
          type: (currentRequest.type as RequestType) || "API",
          url: currentRequest.url || "",
          collectionId: currentRequest.collectionId || null,
          workspaceId: currentRequest.workspaceId || "",
          bodyType: currentRequest.bodyType || "NONE",
          messageType: currentRequest.messageType || "CONNECTION",
          savedMessages: currentRequest.savedMessages || [],
          sortOrder: currentRequest.sortOrder || 0,
        });
      }}
      className={cn(
        "relative cursor-pointer h-8! px-1 rounded-md transition-all gap-2",
        "hover:bg-accent/60 border border-transparent",
        isActive && "bg-accent/80 border-accent-foreground/10",
        "hover:[&_div[data-actions]]:opacity-100",
      )}
    >
      <div className="flex items-center w-full gap-2">
        {/* Method/Type Badge */}
        {currentRequest.type === "API" ? (
          <span
            className={cn(
              "shrink-0 w-[24px] h-[18px] rounded-[4px]  flex justify-center items-center text-[8px] font-bold uppercase border",
              methodBg,
            )}
          >
            {method?.substring(0, 3)}
          </span>
        ) : (
          <span className="shrink-0 rounded-md w-[24px] h-[24px] flex justify-center items-center bg-muted/50 border border-border/50">
            <RequestIcon
              type={(currentRequest.type as RequestType) || "API"}
              className="size-3"
            />
          </span>
        )}

        {/* Content */}
        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-[13px] font-medium truncate",
                isActive ? "text-foreground" : "text-foreground/85",
              )}
            >
              {currentRequest?.name}
            </span>
            {unsaved && (
              <span
                className="shrink-0 size-1.5 rounded-full bg-blue-500"
                title="Unsaved"
              />
            )}
          </div>
        </div>

        {/* Action Button */}
        <div
          data-actions="true"
          data-no-dnd="true"
          className="opacity-0 transition-opacity shrink-0 ml-auto bg-transparent relative z-10"
        >
          <SidebarRequestMenu
            requestId={currentRequest.id}
            requestName={currentRequest?.name || "Request"}
            workspaceId={currentRequest.workspaceId}
            collectionId={currentRequest.collectionId || null}
            type={(currentRequest?.type as RequestType) || "API"}
          />
        </div>
      </div>
    </SidebarMenuButton>
  );
}
