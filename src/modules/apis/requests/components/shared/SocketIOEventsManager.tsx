import {
  IconCheck,
  IconEdit,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface SocketIOEvent {
  id: string;
  name: string;
  listening: boolean;
  description: string;
}

interface SocketIOEventsManagerProps {
  events: SocketIOEvent[];
  onEventsChange: (events: SocketIOEvent[]) => void;
  className?: string;
}

const SocketIOEventsManager: React.FC<SocketIOEventsManagerProps> = ({
  events,
  onEventsChange,
  className,
}) => {
  const [newEventName, setNewEventName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingField, setEditingField] = useState<"name" | "description">(
    "name",
  );

  // Add new event
  const handleAddEvent = () => {
    if (!newEventName.trim()) {
      return;
    }

    // Check for duplicates
    if (events.some((e) => e.name === newEventName.trim())) {
      return;
    }

    const newEvent: SocketIOEvent = {
      id: crypto.randomUUID(),
      name: newEventName.trim(),
      listening: true,
      description: "",
    };
    onEventsChange([...events, newEvent]);
    setNewEventName("");
  };

  // Remove event
  const handleRemoveEvent = (id: string) => {
    onEventsChange(events.filter((e) => e.id !== id));
  };

  // Toggle listening
  const handleToggleListening = (id: string) => {
    onEventsChange(
      events.map((e) => (e.id === id ? { ...e, listening: !e.listening } : e)),
    );
  };

  // Start editing
  const handleStartEdit = (
    id: string,
    field: "name" | "description",
    value: string,
  ) => {
    setEditingId(id);
    setEditingField(field);
    setEditingValue(value);
  };

  // Save edit
  const handleSaveEdit = () => {
    if (!editingId) {
      return;
    }

    onEventsChange(
      events.map((e) =>
        e.id === editingId ? { ...e, [editingField]: editingValue.trim() } : e,
      ),
    );
    setEditingId(null);
    setEditingValue("");
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  // Handle key down for input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (editingId) {
        handleSaveEdit();
      } else {
        handleAddEvent();
      }
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header Row */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Events
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 rounded-md text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10"
                  onClick={() =>
                    document.getElementById("new-event-input")?.focus()
                  }
                >
                  <IconPlus className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px]">
                Add Event
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="w-20 text-center">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Listen
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
            Description
          </span>
        </div>
        <div className="w-8" /> {/* Actions column spacer */}
      </div>

      {/* Events List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="divide-y divide-border/30">
          {/* Add New Event Row */}
          <div className="flex items-center gap-4 px-4 py-2 bg-muted/10">
            <div className="flex-1 min-w-0">
              <Input
                id="new-event-input"
                placeholder="Add event"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-7 text-[11px] border-dashed border-border/50 bg-transparent focus-visible:ring-1 focus-visible:ring-indigo-500/40"
              />
            </div>
            <div className="w-20 flex justify-center">
              <Switch disabled className="opacity-30" />
            </div>
            <div className="flex-1 min-w-0">
              <Input
                placeholder="Add description"
                disabled
                className="h-7 text-[11px] border-dashed border-border/50 bg-transparent opacity-30"
              />
            </div>
            <div className="w-8">
              {newEventName.trim() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddEvent}
                  className="h-6 w-6 p-0 rounded-md text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10"
                >
                  <IconCheck className="size-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Existing Events */}
          {events.map((event) => (
            <div
              key={event.id}
              className={cn(
                "flex items-center gap-4 px-4 py-2 group transition-colors",
                event.listening
                  ? "hover:bg-indigo-500/5"
                  : "opacity-60 hover:opacity-100",
              )}
            >
              {/* Event Name */}
              <div className="flex-1 min-w-0">
                {editingId === event.id && editingField === "name" ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-7 text-[11px] flex-1"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveEdit}
                      className="h-6 w-6 p-0 rounded-md text-emerald-500 hover:bg-emerald-500/10"
                    >
                      <IconCheck className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                    >
                      <IconX className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1.5 cursor-pointer group/name"
                    onClick={() =>
                      handleStartEdit(event.id, "name", event.name)
                    }
                  >
                    <span className="text-[12px] font-medium text-foreground truncate">
                      {event.name}
                    </span>
                    <IconEdit className="size-3 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>

              {/* Listen Toggle */}
              <div className="w-20 flex justify-center">
                <Switch
                  checked={event.listening}
                  onCheckedChange={() => handleToggleListening(event.id)}
                  className={cn("data-[state=checked]:bg-indigo-500")}
                />
              </div>

              {/* Description */}
              <div className="flex-1 min-w-0">
                {editingId === event.id && editingField === "description" ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="h-7 text-[11px] flex-1"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveEdit}
                      className="h-6 w-6 p-0 rounded-md text-emerald-500 hover:bg-emerald-500/10"
                    >
                      <IconCheck className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                    >
                      <IconX className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1.5 cursor-pointer group/desc"
                    onClick={() =>
                      handleStartEdit(
                        event.id,
                        "description",
                        event.description,
                      )
                    }
                  >
                    <span
                      className={cn(
                        "text-[11px] truncate",
                        event.description
                          ? "text-muted-foreground"
                          : "text-muted-foreground/50 italic",
                      )}
                    >
                      {event.description || "Add description"}
                    </span>
                    <IconEdit className="size-3 text-muted-foreground opacity-0 group-hover/desc:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>

              {/* Delete Button */}
              <div className="w-8">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEvent(event.id)}
                  className="h-6 w-6 p-0 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                >
                  <IconTrash className="size-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <div className="size-12 rounded-lg bg-linear-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center">
                <IconPlus className="size-6 text-indigo-500/40" />
              </div>
              <span className="text-sm font-medium text-foreground/60">
                No events registered
              </span>
              <span className="text-[11px] text-muted-foreground/60">
                Add events to listen for incoming messages
              </span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SocketIOEventsManager;
