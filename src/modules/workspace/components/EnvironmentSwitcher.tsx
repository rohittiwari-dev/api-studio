"use client";

import { motion } from "framer-motion";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  LayoutGrid,
  List,
  Lock,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Unlock,
  Zap,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  createEnvironmentAction,
  deleteEnvironmentAction,
  getEnvironmentsByWorkspace,
  updateEnvironmentAction,
} from "@/modules/apis/environment/actions";
import useEnvironmentStore, {
  type EnvironmentState,
  type EnvironmentVariable,
} from "@/modules/apis/environment/store/environment.store";
import useWorkspaceState from "@/modules/workspace/store";

const EnvironmentSwitcher = () => {
  const {
    environments,
    activeEnvironmentId,
    setEnvironments,
    setActiveEnvironment,
    addEnvironment,
    updateEnvironment,
    removeEnvironment,
  } = useEnvironmentStore();

  const { activeWorkspace } = useWorkspaceState();
  const activeWorkspaceId = activeWorkspace?.id;
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEnvName, setNewEnvName] = useState("");
  const [editedVariables, setEditedVariables] = useState<EnvironmentVariable[]>(
    [],
  );
  const [revealedRows, setRevealedRows] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [envSearchTerm, setEnvSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const toggleRowVisibility = (index: number) => {
    setRevealedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Compute the effective selected environment ID without using effects
  const effectiveSelectedEnvId =
    selectedEnvId ?? activeEnvironmentId ?? environments[0]?.id ?? null;

  // Compute the currently selected environment from the ID
  const selectedEnv = environments.find((e) => e.id === effectiveSelectedEnvId);

  // Helper to select an environment and load its variables atomically
  const selectEnvironment = useCallback(
    (envId: string | null) => {
      setSelectedEnvId(envId);
      if (envId) {
        const env = environments.find((e) => e.id === envId);
        setEditedVariables(env?.variables || []);
      } else {
        setEditedVariables([]);
      }
    },
    [environments],
  );

  // Initialize editedVariables for the first render when we have a default selection
  const initialVariables = useMemo(() => {
    if (selectedEnvId === null && selectedEnv) {
      return selectedEnv.variables || [];
    }
    return null;
  }, [selectedEnvId, selectedEnv]);

  if (
    initialVariables !== null &&
    editedVariables.length === 0 &&
    initialVariables.length > 0
  ) {
    setEditedVariables(initialVariables);
  }

  const loadEnvironments = useCallback(async () => {
    if (!activeWorkspaceId) {
      return;
    }
    try {
      const envs = await getEnvironmentsByWorkspace(activeWorkspaceId);
      const mapped = envs.map(
        (env): EnvironmentState => ({
          id: env.id,
          name: env.name,
          description: env.description,
          variables: Array.isArray(env.variables)
            ? (env.variables as unknown as EnvironmentVariable[])
            : [],
          isGlobal: env.isGlobal,
          workspaceId: env.workspaceId,
        }),
      );
      setEnvironments(mapped);
    } catch (error) {
      console.error("Failed to load environments", error);
    }
  }, [activeWorkspaceId, setEnvironments]);

  useEffect(() => {
    if (activeWorkspaceId) {
      loadEnvironments();
    }
  }, [activeWorkspaceId, loadEnvironments]);

  const handleCreate = async () => {
    if (!activeWorkspace?.id || !newEnvName?.trim()) {
      return;
    }
    try {
      const env = await createEnvironmentAction(
        activeWorkspace.id,
        newEnvName?.trim(),
        [],
      );
      const newEnv: EnvironmentState = {
        id: env.id,
        name: env.name,
        description: env.description,
        variables: [],
        isGlobal: env.isGlobal,
        workspaceId: env.workspaceId,
      };
      addEnvironment(newEnv);
      setNewEnvName("");
      setIsCreateDialogOpen(false);
      selectEnvironment(newEnv.id);
      toast.success("Environment created");
    } catch (_error) {
      toast.error("Failed to create environment");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteEnvironmentAction(id);
      removeEnvironment(id);
      if (effectiveSelectedEnvId === id) {
        selectEnvironment(environments[0]?.id || null);
      }
      if (activeEnvironmentId === id) {
        setActiveEnvironment(null);
      }
      toast.success("Environment deleted");
    } catch (_error) {
      toast.error("Failed to delete environment");
    }
  };

  const handleVariableChange = (
    index: number,
    field: keyof EnvironmentVariable,
    value: string | boolean,
  ) => {
    const newVars = [...editedVariables];
    newVars[index] = { ...newVars[index], [field]: value };
    setEditedVariables(newVars);
  };

  const handleAddVariable = () => {
    setEditedVariables([
      ...editedVariables,
      { key: "", value: "", enabled: true, type: "default" },
    ]);
  };

  const handleRemoveVariable = (index: number) => {
    setEditedVariables(editedVariables.filter((_, i) => i !== index));
  };

  const handleSaveVariables = async () => {
    if (!effectiveSelectedEnvId) {
      return;
    }
    try {
      const validVariables = editedVariables.filter(
        (v) => v.key?.trim() !== "",
      );
      await updateEnvironmentAction(effectiveSelectedEnvId, {
        variables: validVariables,
      });
      updateEnvironment(effectiveSelectedEnvId, {
        variables: validVariables,
      });
      setEditedVariables(validVariables);
      toast.success("Variables saved successfully");
    } catch (_error) {
      toast.error("Failed to save variables");
    }
  };

  // Filter variables for display
  const filteredVariables = editedVariables
    .map((v, i) => ({ ...v, originalIndex: i }))
    .filter(
      (v) =>
        v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const filteredEnvironments = environments.filter((env) =>
    env.name.toLowerCase().includes(envSearchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-full w-full bg-muted/5 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[80px]" />
      </div>

      {/* Sidebar list */}
      <div className="w-[260px] border-r border-border/40 bg-background/40 backdrop-blur-sm flex flex-col z-10">
        <div className="p-4 border-b border-border/40 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Environments
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              className="h-9 pl-9 text-xs bg-background/50 border-border/40 hover:bg-background/80 focus-visible:bg-background focus-visible:ring-primary/20 rounded-lg transition-all"
              placeholder="Search environments..."
              value={envSearchTerm}
              onChange={(e) => setEnvSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-3">
          <div className="space-y-1">
            {filteredEnvironments.map((env, i) => {
              const isActive = activeEnvironmentId === env.id;
              const isSelected = effectiveSelectedEnvId === env.id;

              return (
                <motion.div
                  key={env.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "group w-full flex items-center justify-between p-3 rounded-xl text-left cursor-pointer transition-all duration-200 border",
                    isSelected
                      ? "bg-background/60 border-border/60 shadow-sm"
                      : "bg-transparent border-transparent hover:bg-background/40 hover:border-border/40",
                  )}
                  onClick={() => selectEnvironment(env.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground group-hover:bg-muted",
                      )}
                    >
                      <Zap
                        className={cn("size-4", isActive && "fill-current")}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className={cn(
                          "truncate font-medium text-sm",
                          isSelected
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      >
                        {env.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {env.variables.length} variables
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 hover:bg-background/80 rounded-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="size-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-44 p-1.5 rounded-xl border-border/40 bg-background/95 backdrop-blur-xl"
                      >
                        {!isActive && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveEnvironment(env.id);
                              toast.success(`Active: ${env.name}`);
                            }}
                            className="text-xs p-2 rounded-lg"
                          >
                            <Check className="mr-2 size-4" /> Set as Active
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(
                              JSON.stringify(env.variables, null, 2),
                            );
                          }}
                          className="text-xs p-2 rounded-lg"
                        >
                          <Copy className="mr-2 size-4" /> Copy Variables
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-border/40" />
                        <DropdownMenuItem
                          onClick={(e) => handleDelete(env.id, e as any)}
                          className="text-destructive focus:text-destructive text-xs p-2 rounded-lg"
                        >
                          <Trash2 className="mr-2 size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              );
            })}

            {filteredEnvironments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground/60">
                <p className="text-xs">No environments found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {selectedEnv ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Globe className="size-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">
                      {selectedEnv.name}
                    </h2>
                    {activeEnvironmentId === selectedEnv.id && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-primary/10 text-primary uppercase tracking-wide">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedEnv.variables.length} variables configured
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group w-52 transition-all focus-within:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    className="h-9 pl-9 text-xs bg-background/50 border-border/40 hover:bg-background/80 focus-visible:bg-background focus-visible:ring-primary/20 rounded-lg transition-all"
                    placeholder="Filter variables..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="h-5 w-px bg-border/40" />

                <Tabs
                  value={viewMode}
                  onValueChange={(v: any) => setViewMode(v)}
                >
                  <TabsList className="h-9 p-1 bg-muted/40 rounded-lg">
                    <TabsTrigger
                      value="list"
                      className="size-7 p-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <List className="size-4" />
                    </TabsTrigger>
                    <TabsTrigger
                      value="grid"
                      className="size-7 p-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <LayoutGrid className="size-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button
                  type="button"
                  onClick={handleSaveVariables}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 h-9 text-xs px-4 rounded-lg shadow-sm"
                >
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Variables Content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {viewMode === "list" && (
                <div className="grid grid-cols-[40px_1fr_1fr_90px_40px] gap-4 px-6 py-3 border-b border-border/40 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/10">
                  <div className="flex justify-center">On</div>
                  <div>Key</div>
                  <div>Value</div>
                  <div>Type</div>
                  <div className="text-center">Del</div>
                </div>
              )}

              <ScrollArea className="flex-1 h-full">
                <div
                  className={cn(
                    "p-6 pb-24",
                    viewMode === "grid"
                      ? "grid grid-cols-2 xl:grid-cols-3 gap-4"
                      : "space-y-1",
                  )}
                >
                  {filteredVariables.map(
                    ({ originalIndex: index, ...variable }, i) => {
                      const isSecret = variable.type === "secret";
                      const isRevealed = revealedRows.has(index);

                      if (viewMode === "grid") {
                        return (
                          <motion.div
                            key={index}
                            initial={{
                              opacity: 0,
                              scale: 0.95,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                            }}
                            transition={{
                              delay: i * 0.03,
                            }}
                            className={cn(
                              "group relative p-4 rounded-xl border bg-background/40 backdrop-blur-sm hover:bg-background/60 transition-all duration-300",
                              !variable.enabled
                                ? "opacity-60 border-dashed border-border/40"
                                : "border-border/40 hover:border-border/60",
                            )}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={variable.enabled}
                                  onCheckedChange={(checked) =>
                                    handleVariableChange(
                                      index,
                                      "enabled",
                                      Boolean(checked),
                                    )
                                  }
                                  className="size-4 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleVariableChange(
                                      index,
                                      "type",
                                      isSecret ? "default" : "secret",
                                    )
                                  }
                                  className={cn(
                                    "text-[10px] px-2 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors",
                                    isSecret
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      : "bg-muted text-muted-foreground",
                                  )}
                                >
                                  {isSecret ? (
                                    <Lock className="size-3" />
                                  ) : (
                                    <Unlock className="size-3" />
                                  )}
                                  {isSecret ? "Secret" : "Plain"}
                                </button>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveVariable(index)}
                                className="size-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Input
                                value={variable.key}
                                onChange={(e) =>
                                  handleVariableChange(
                                    index,
                                    "key",
                                    e.target.value,
                                  )
                                }
                                placeholder="KEY"
                                className="h-9 font-mono text-xs bg-muted/30 border-transparent focus-visible:bg-background focus-visible:ring-primary/20 px-3 rounded-lg"
                              />
                              <div className="relative">
                                <Input
                                  type={
                                    !isSecret || isRevealed
                                      ? "text"
                                      : "password"
                                  }
                                  value={variable.value}
                                  onChange={(e) =>
                                    handleVariableChange(
                                      index,
                                      "value",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Value"
                                  className={cn(
                                    "h-9 font-mono text-xs bg-muted/30 border-transparent focus-visible:bg-background focus-visible:ring-primary/20 px-3 pr-9 rounded-lg",
                                    isSecret && "text-primary font-medium",
                                  )}
                                />
                                {isSecret && (
                                  <button
                                    type="button"
                                    onClick={() => toggleRowVisibility(index)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/40 hover:text-foreground rounded transition-colors"
                                  >
                                    {isRevealed ? (
                                      <EyeOff className="size-4" />
                                    ) : (
                                      <Eye className="size-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div
                          key={index}
                          initial={{
                            opacity: 0,
                            y: 5,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: i * 0.02,
                          }}
                          className="group grid grid-cols-[40px_1fr_1fr_90px_40px] gap-4 px-6 py-2 rounded-lg hover:bg-muted/30 transition-colors items-center"
                        >
                          {/* Checkbox */}
                          <div className="flex justify-center">
                            <Checkbox
                              checked={variable.enabled}
                              onCheckedChange={(checked) =>
                                handleVariableChange(
                                  index,
                                  "enabled",
                                  Boolean(checked),
                                )
                              }
                              className="size-4 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </div>

                          {/* Key */}
                          <div className="relative">
                            <Input
                              value={variable.key}
                              onChange={(e) =>
                                handleVariableChange(
                                  index,
                                  "key",
                                  e.target.value,
                                )
                              }
                              placeholder="KEY"
                              className="h-8 font-mono text-xs border-transparent bg-transparent hover:bg-muted/40 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 px-2 rounded-lg transition-all"
                            />
                          </div>

                          {/* Value */}
                          <div className="relative group/value">
                            <Input
                              type={
                                !isSecret || isRevealed ? "text" : "password"
                              }
                              value={variable.value}
                              onChange={(e) =>
                                handleVariableChange(
                                  index,
                                  "value",
                                  e.target.value,
                                )
                              }
                              placeholder="Value"
                              className={cn(
                                "h-8 font-mono text-xs border-transparent bg-transparent hover:bg-muted/40 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/30 px-2 pr-8 rounded-lg transition-all",
                                isSecret && "text-primary font-medium",
                              )}
                            />
                            {isSecret && (
                              <button
                                type="button"
                                onClick={() => toggleRowVisibility(index)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground/30 hover:text-primary opacity-0 group-hover/value:opacity-100 transition-all"
                              >
                                {isRevealed ? (
                                  <EyeOff className="size-3.5" />
                                ) : (
                                  <Eye className="size-3.5" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Type */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleVariableChange(
                                index,
                                "type",
                                isSecret ? "default" : "secret",
                              )
                            }
                            className={cn(
                              "h-7 px-2 rounded-lg text-[10px] font-medium w-full justify-start gap-1.5 hover:bg-transparent border",
                              isSecret
                                ? "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400"
                                : "text-muted-foreground bg-muted/30 border-transparent",
                            )}
                          >
                            {isSecret ? (
                              <Lock className="size-3" />
                            ) : (
                              <Unlock className="size-3" />
                            )}
                            {isSecret ? "Secret" : "Plain"}
                          </Button>

                          {/* Delete */}
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveVariable(index)}
                              className="size-7 rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    },
                  )}

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleAddVariable}
                      className="w-full h-10 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground/60 hover:text-primary border border-dashed border-border/40 hover:border-primary/30 hover:bg-primary/5 rounded-xl transition-all duration-200 group"
                    >
                      <Plus className="size-4 transition-transform group-hover:scale-110" />
                      Add New Variable
                    </button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-12"
          >
            <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Zap className="size-10 text-primary/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No Environment Selected
            </h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
              Select an environment from the sidebar or create a new one to
              manage your variables.
            </p>
            <Button
              type="button"
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-2 h-10 px-5 bg-primary hover:bg-primary/90 rounded-xl"
            >
              <Plus className="size-4" /> Create Environment
            </Button>
          </motion.div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[420px] gap-0 p-0 overflow-hidden border-border/40 shadow-2xl bg-background/95 backdrop-blur-xl rounded-2xl">
          <div className="p-6 border-b border-border/40 bg-muted/5">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="size-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  New Environment
                </DialogTitle>
                <DialogDescription className="text-sm mt-0.5">
                  Create a new space for your variables
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="env-name"
                className="text-xs font-medium text-muted-foreground"
              >
                Environment Name
              </label>

              <Input
                id="env-name"
                placeholder="e.g. Production, Staging, Development"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                className="h-10 bg-muted/30 border-border/40 focus-visible:ring-primary/20 rounded-lg"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="p-4 bg-muted/10 border-t border-border/40 gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
              className="h-9 px-4 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              className="h-9 px-5 bg-primary hover:bg-primary/90 rounded-lg"
            >
              Create Environment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnvironmentSwitcher;
