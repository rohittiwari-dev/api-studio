"use client";

import { AlertCircle, Copy, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  getWorkspaceAiConfig,
  updateWorkspaceAiConfig,
} from "@/modules/workspace/server/workspace.actions";
import useWorkspaceState from "@/modules/workspace/store";

export function AiConfigCard() {
  const { activeWorkspace, setActiveWorkspace, workspaces } =
    useWorkspaceState();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [provider, setProvider] = useState("google");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.0-flash");

  const [copyOpen, setCopyOpen] = useState(false);
  const [copyingState, setCopyingState] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      if (!activeWorkspace?.id) return;
      setLoading(true);
      let config = activeWorkspace.aiConfig as {
        provider: string;
        apiKey: string;
        model?: string;
        enabled?: boolean;
      } | null;
      if (
        !config?.provider ||
        !config?.apiKey ||
        !config?.model ||
        !config?.enabled
      ) {
        config = await getWorkspaceAiConfig(activeWorkspace.id);
      }
      if (config) {
        setEnabled((config as any).enabled ?? true);
        setProvider(config.provider || "google");
        setApiKey(config.apiKey || "");
        setModel(config.model || "gemini-2.0-flash");
      }
      setLoading(false);
    }
    loadConfig();
  }, [activeWorkspace?.id, activeWorkspace?.aiConfig]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeWorkspace?.id) return;
    setSaving(true);

    const newConfig = { enabled, provider, apiKey, model };
    const { success, error } = await updateWorkspaceAiConfig(
      activeWorkspace.id,
      newConfig,
    );

    if (success) {
      toast.success("AI Configuration saved successfully!");
      // Update global store state so AskAi components react immediately!
      setActiveWorkspace({
        ...activeWorkspace,
        aiConfig: newConfig,
      } as any);
    } else {
      toast.error(error || "Failed to save configuration.");
    }
    setSaving(false);
  };

  const handleCopyFromWorkspace = async (sourceWorkspaceId: string) => {
    setCopyingState(true);
    try {
      const config = await getWorkspaceAiConfig(sourceWorkspaceId);
      if (!config || !config.apiKey) {
        toast.error("The selected workspace has no AI configuration to copy.");
        return;
      }

      setEnabled((config as any).enabled ?? true);
      setProvider(config.provider);
      setApiKey(config.apiKey);
      setModel(config.model || "");
      toast.success("Config copied! Remember to save your changes.");
      setCopyOpen(false);
    } catch (_err) {
      toast.error("Failed to copy configuration.");
    } finally {
      setCopyingState(false);
    }
  };

  const otherWorkspaces =
    workspaces?.filter((w) => w.id !== activeWorkspace?.id) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" />
            AI Integrations
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-lg">
            Give your Workspace access to AI debugging, real-time code
            generation, and chat by supplying an API key.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="ai-toggle"
            className="text-xs text-muted-foreground cursor-pointer"
          >
            {enabled ? "Enabled" : "Disabled"}
          </Label>
          <Switch
            id="ai-toggle"
            checked={enabled}
            disabled={loading}
            onCheckedChange={(val) => setEnabled(val)}
          />
        </div>
      </div>

      <div
        className={`transition-all duration-300 overflow-hidden ${enabled ? "opacity-100" : "opacity-40 grayscale pointer-events-none"}`}
      >
        <div className="p-4 rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm space-y-4">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <p className="text-xs font-medium text-foreground">
                Provider Settings
              </p>
              <Popover open={copyOpen} onOpenChange={setCopyOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={otherWorkspaces.length === 0}
                    className="h-6 px-2 text-[10px] gap-1.5 hover:bg-violet-500/10 hover:text-violet-500 disabled:opacity-50"
                  >
                    <Copy className="size-3" />
                    Copy from Workspace
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-[200px] p-1.5 shadow-xl"
                >
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground px-2 py-1.5">
                    Select Origin
                  </p>
                  <div className="space-y-0.5">
                    {otherWorkspaces.length === 0 ? (
                      <p className="text-[10px] items-center italic text-muted-foreground px-2">
                        No other workspaces found.
                      </p>
                    ) : (
                      otherWorkspaces.map((w) => (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => handleCopyFromWorkspace(w.id)}
                          disabled={copyingState}
                          className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted transition-colors disabled:opacity-50"
                        >
                          <span className="truncate flex-1">{w.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider" className="text-xs">
                  AI Provider
                </Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger id="provider" className="h-8 text-xs">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Gemini</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-xs">
                  Model Name
                </Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={
                    provider === "google" ? "gemini-2.0-flash" : "gpt-4o-mini"
                  }
                  required
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-xs">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                required
                className="h-8 text-xs font-mono placeholder:font-sans"
              />
            </div>

            <div className="pt-2 flex justify-between items-center">
              <p className="text-[10px] text-muted-foreground/80 flex items-center gap-1.5">
                <AlertCircle className="size-3" />
                API key is sent securely on action triggers
              </p>
              <Button
                type="submit"
                size="sm"
                disabled={saving || !apiKey || loading}
                className="gap-2 h-8 text-xs"
              >
                {saving && <Loader2 className="size-3 animate-spin" />}
                Save AI Settings
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
