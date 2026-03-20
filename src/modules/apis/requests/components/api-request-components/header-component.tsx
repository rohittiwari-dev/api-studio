"use client";

import { FileText, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EnvironmentVariableInput } from "@/components/ui/environment-variable-input";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AiGenerateButton } from "@/modules/ai/components/AiGenerateButton";
import useRequestSyncStoreState from "../../hooks/requestSyncStore";

const HeaderComponent = () => {
  const { activeRequest, updateRequest } = useRequestSyncStoreState();
  const headers = activeRequest?.headers || [];

  const addHeader = () => {
    const updatedHeaders = [
      ...headers,
      { key: "", value: "", description: "", isActive: true },
    ];
    updateRequest(activeRequest?.id || "", {
      headers: updatedHeaders,
      unsaved: true,
    });
  };

  const updateHeader = (
    index: number,
    field: string,
    value: string | boolean,
  ) => {
    const newHeaders = [...headers];
    (newHeaders[index] as any)[field] = value;
    updateRequest(activeRequest?.id || "", {
      headers: newHeaders,
      unsaved: true,
    });
  };

  const removeHeader = (index: number) => {
    updateRequest(activeRequest?.id || "", {
      headers: headers.filter((_, i) => i !== index),
      unsaved: true,
    });
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Empty State */}
      {headers.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
          <div className="size-14 rounded-2xl bg-linear-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center">
            <FileText className="size-6 text-indigo-500/60" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">
              No headers yet
            </p>
            <p className="text-xs text-muted-foreground max-w-[220px]">
              Add custom HTTP headers to be sent with your request
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHeader}
              className="h-9 text-xs gap-2 rounded-lg border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/40 bg-background"
            >
              <Plus className="size-3.5" /> Add Header
            </Button>
            <AiGenerateButton
              type="headers"
              label="Generate Headers"
              className="h-9 rounded-lg"
              context={{
                url: activeRequest?.url ?? undefined,
                method: activeRequest?.method ?? undefined,
              }}
              onGenerated={(data) => {
                const d = data as {
                  headers: {
                    key: string;
                    value: string;
                    description?: string;
                  }[];
                };
                updateRequest(activeRequest?.id || "", {
                  headers: [
                    ...headers,
                    ...d.headers.map((h) => ({
                      ...h,
                      isActive: true,
                      description: h.description ?? "",
                    })),
                  ],
                  unsaved: true,
                });
              }}
            />
          </div>
        </div>
      )}

      {/* Headers List */}
      {headers.length > 0 && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between px-1 pb-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
              {headers.length} header{headers.length !== 1 ? "s" : ""}
            </div>
            <AiGenerateButton
              type="headers"
              context={{
                url: activeRequest?.url ?? undefined,
                method: activeRequest?.method ?? undefined,
              }}
              onGenerated={(data) => {
                const d = data as {
                  headers: {
                    key: string;
                    value: string;
                    description?: string;
                  }[];
                };
                updateRequest(activeRequest?.id || "", {
                  headers: [
                    ...headers,
                    ...d.headers.map((h) => ({
                      ...h,
                      isActive: true,
                      description: h.description ?? "",
                    })),
                  ],
                  unsaved: true,
                });
              }}
            />
          </div>
          <div className="grid grid-cols-[32px_1fr_1fr_1fr_32px] gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-indigo-600/60 dark:text-indigo-400/60">
            <div></div>
            <div>Header Name</div>
            <div>Value</div>
            <div>Description</div>
            <div></div>
          </div>

          {/* Header Rows */}
          <div className="flex flex-col gap-0.5">
            {headers.map((header, index) => (
              <div
                key={index?.toString()}
                className={cn(
                  "group grid grid-cols-[32px_1fr_1fr_1fr_32px] gap-3 px-3 py-1.5 rounded-lg border border-transparent transition-all duration-200 items-center",
                  "hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 hover:border-indigo-500/20",
                  !header.isActive && "opacity-50",
                )}
              >
                {/* Checkbox */}
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={header.isActive}
                    onCheckedChange={(checked) =>
                      updateHeader(index, "isActive", Boolean(checked))
                    }
                    className="size-4 rounded-md data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 shadow-sm"
                  />
                </div>

                {/* Key */}
                <div className="relative">
                  <Input
                    placeholder="e.g. Content-Type"
                    value={header.key}
                    onChange={(e) => updateHeader(index, "key", e.target.value)}
                    className="h-8 font-mono text-xs border-transparent bg-transparent hover:bg-muted/60 focus-visible:bg-background focus-visible:border-indigo-500/40 focus-visible:ring-2 focus-visible:ring-indigo-500/20 px-2.5 rounded-md transition-all"
                  />
                </div>

                {/* Value */}
                <div className="relative">
                  <EnvironmentVariableInput
                    placeholder="e.g. application/json"
                    value={header.value}
                    onChange={(value) => updateHeader(index, "value", value)}
                    className="h-8 font-mono text-xs border-transparent bg-transparent hover:bg-muted/60 focus-visible:bg-background focus-visible:border-indigo-500/40 focus-visible:ring-2 focus-visible:ring-indigo-500/20 px-2.5 rounded-md transition-all"
                  />
                </div>

                {/* Description */}
                <div className="relative">
                  <Input
                    placeholder="e.g. Request body format"
                    value={header.description}
                    onChange={(e) =>
                      updateHeader(index, "description", e.target.value)
                    }
                    className="h-8 text-xs text-muted-foreground border-transparent bg-transparent hover:bg-muted/60 focus-visible:bg-background focus-visible:border-indigo-500/40 focus-visible:ring-2 focus-visible:ring-indigo-500/20 px-2.5 rounded-md transition-all"
                  />
                </div>

                {/* Delete */}
                <div className="flex items-center justify-center">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeHeader(index)}
                    className="h-7 w-7 rounded-md text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Button */}
          <button
            type="button"
            onClick={addHeader}
            className="flex items-center justify-center gap-2 h-9 text-xs rounded-lg text-muted-foreground/60 hover:text-indigo-600 dark:hover:text-indigo-400 border border-dashed border-border/50 hover:border-indigo-500/40 hover:bg-indigo-500/5 w-full transition-all duration-200"
          >
            <Plus className="size-3.5" /> Add Header
          </button>
        </>
      )}
    </div>
  );
};

export default HeaderComponent;
