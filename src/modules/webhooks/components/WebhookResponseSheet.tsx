"use client";

import {
  Code,
  FileJson,
  Loader2,
  Plus,
  Radio,
  Save,
  Server,
  Settings,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUpdateWebhook } from "../hooks/queries";
import type { Webhook } from "../types/webhook.types";

interface WebhookResponseSheetProps {
  webhook: Webhook;
}

export default function WebhookResponseSheet({
  webhook,
}: WebhookResponseSheetProps) {
  const [open, setOpen] = useState(false);
  const updateWebhook = useUpdateWebhook();

  const [status, setStatus] = useState(webhook.responseConfig?.status || 200);
  const [contentType, setContentType] = useState(
    webhook.responseConfig?.contentType || "application/json",
  );
  const [body, setBody] = useState(
    webhook.responseConfig?.body || '{\n  "status": "success"\n}',
  );
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>(
    Object.entries(webhook.responseConfig?.headers || {}).map(
      ([key, value]) => ({ key, value: String(value) }),
    ),
  );

  const handleAddHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleSave = async () => {
    try {
      const headerObj: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.key.trim()) {
          headerObj[h.key.trim()] = h.value;
        }
      });

      await updateWebhook.mutateAsync({
        id: webhook.id,
        data: {
          responseConfig: {
            status,
            contentType,
            body,
            headers: headerObj,
          },
        },
      });
      toast.success("Response configuration saved");
      setOpen(false);
    } catch (_error) {
      toast.error("Failed to save response configuration");
    }
  };

  const confirmClear = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await updateWebhook.mutateAsync({
        id: webhook.id,
        data: {
          responseConfig: null,
        },
      });
      toast.success("Response configuration cleared");
      setOpen(false);
    } catch (_error) {
      toast.error("Failed to clear response configuration");
    }
  };

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) {
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    }
    if (code >= 300 && code < 400) {
      return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
    if (code >= 400 && code < 500) {
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    }
    if (code >= 500) {
      return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    }
    return "text-muted-foreground bg-muted border-border";
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-2 bg-background/50  border-white/10 dark:border-white/10 hover:bg-background/80 transition-all hover:shadow-md"
        >
          <Settings className="size-3.5" />
          <span className="hidden sm:inline">Configure Response</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl p-0 flex flex-col backdrop-blur-3xl! bg-background/90 dark:bg-background/30! border-l">
        <SheetHeader className="px-6 py-6 border-b space-y-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Server className="size-5" />
              </div>
              <SheetTitle className="text-xl">
                Response Configuration
              </SheetTitle>
            </div>
            {webhook.responseConfig && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={updateWebhook.isPending}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Trash2 className="size-3.5" />
                    Clear Settings
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your custom response configuration and the webhook will
                      revert to its default behavior.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={updateWebhook.isPending}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={confirmClear}
                      disabled={updateWebhook.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {updateWebhook.isPending && (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      )}
                      Clear Configuration
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <SheetDescription className="text-base">
            Customize the HTTP response sent back to the requester.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Main Config Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                <Sparkles className="size-4" />
                Response Settings
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Status Code
                  </Label>
                  <div className="relative">
                    <Input
                      id="status"
                      type="number"
                      value={status}
                      onChange={(e) =>
                        setStatus(parseInt(e.target.value, 10) || 200)
                      }
                      className={cn(
                        "font-mono font-medium pl-3 py-1 pr-16 border-border/50 bg-background/50 focus:bg-background transition-colors",
                        getStatusColor(status).split(" ")[0], // Apply text color
                      )}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-mono",
                          getStatusColor(status),
                        )}
                      >
                        HTTP
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="contentType"
                    className="text-xs font-semibold uppercase text-muted-foreground"
                  >
                    Content Type
                  </Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger
                      id="contentType"
                      className="h-11 border-border/50 bg-background/50 focus:bg-background transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileJson className="size-4 text-muted-foreground" />
                        <SelectValue placeholder="Select content type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="application/json">
                        application/json
                      </SelectItem>
                      <SelectItem value="text/plain">text/plain</SelectItem>
                      <SelectItem value="application/xml">
                        application/xml
                      </SelectItem>
                      <SelectItem value="text/html">text/html</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Headers Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  <Radio className="size-4" />
                  Custom Headers
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddHeader}
                  className="h-7 text-xs gap-1.5 border-dashed"
                >
                  <Plus className="size-3" /> Add Header
                </Button>
              </div>

              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-border/50">
                {headers.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    <p className="opacity-50">No headers configured</p>
                    <p className="text-xs opacity-40 mt-1">
                      Add headers to customize response metadata
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {headers.map((header, index) => (
                      <div
                        key={index?.toString()}
                        className="flex gap-2 group items-start"
                      >
                        <Input
                          placeholder="Header-Name"
                          value={header.key}
                          onChange={(e) =>
                            handleHeaderChange(index, "key", e.target.value)
                          }
                          className="flex-1 h-9 font-mono text-xs bg-background border-border/50 focus:border-primary/50"
                        />
                        <div className="py-2 text-muted-foreground font-mono text-xs">
                          :
                        </div>
                        <Input
                          placeholder="Value"
                          value={header.value}
                          onChange={(e) =>
                            handleHeaderChange(index, "value", e.target.value)
                          }
                          className="flex-1 h-9 font-mono text-xs bg-background border-border/50 focus:border-primary/50"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveHeader(index)}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Body Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                <Code className="size-4" />
                Response Body
              </div>
              <div className="relative group">
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-mono bg-background/80 backdrop-blur"
                  >
                    {contentType}
                  </Badge>
                </div>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="font-mono text-sm min-h-[300px] resize-y bg-slate-100 tex-slate-700 dark:bg-slate-950 dark:text-slate-50 border-slate-300 dark:border-slate-800 focus:border-slate-700 p-4 leading-relaxed"
                  placeholder="Enter response body..."
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-transparent! grid grid-cols-2 gap-3">
          <SheetClose asChild>
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateWebhook.isPending}
            className="w-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20"
          >
            {updateWebhook.isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            Save Configuration
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
