"use client";

import {
  Check,
  Cookie as CookieIcon,
  Copy,
  Edit2,
  Globe,
  Lock,
  Plus,
  Search,
  Shield,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import React, { useState } from "react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import useCookieStore, { type Cookie } from "../store/cookie.store";

// Copy button with animation
const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "p-1.5 rounded-lg transition-all",
        copied
          ? "bg-emerald-500/20 text-emerald-500"
          : "hover:bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
    </button>
  );
};

// Cookie card component
const CookieCard = ({
  cookie,
  onEdit,
  onDelete,
}: {
  cookie: Cookie;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="group relative p-4 rounded-xl bg-linear-to-br from-muted/50 to-muted/20 border border-border/50 hover:border-amber-500/30 hover:from-amber-500/5 hover:to-transparent transition-all duration-200">
    {/* Header */}
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
          <CookieIcon className="size-4 text-amber-500" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate">
            {cookie.key}
          </h4>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Globe className="size-2.5" />
            <span className="truncate">{cookie.domain}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Edit2 className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>

    {/* Value */}
    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-background/50 border border-border/30 group/value">
      <code className="text-[11px] font-mono text-muted-foreground break-all flex-1 line-clamp-2">
        {cookie.value || <span className="italic opacity-50">empty</span>}
      </code>
      <div className="opacity-0 group-hover/value:opacity-100 transition-opacity shrink-0">
        <CopyButton value={cookie.value} />
      </div>
    </div>

    {/* Footer badges */}
    <div className="flex items-center gap-2 mt-3">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-muted text-muted-foreground">
        <span className="font-mono">{cookie.path}</span>
      </span>
      {cookie.secure && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Lock className="size-2.5" />
          Secure
        </span>
      )}
      {cookie.httpOnly && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Shield className="size-2.5" />
          HttpOnly
        </span>
      )}
    </div>
  </div>
);

const CookieManager = () => {
  const {
    getAllCookiesForCurrentWorkspace,
    addCookie,
    updateCookie,
    removeCookie,
    clearCookies,
    clearExpiredCookies,
  } = useCookieStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [editingCookie, setEditingCookie] = useState<Cookie | null>(null);
  const [filterDomain, setFilterDomain] = useState("");
  const [formData, setFormData] = useState<Partial<Cookie>>({
    key: "",
    value: "",
    domain: "",
    path: "/",
    secure: false,
    httpOnly: false,
  });

  // Get only cookies for current workspace
  const cookies = getAllCookiesForCurrentWorkspace();

  // Clear expired cookies on mount
  React.useEffect(() => {
    const clearedCount = clearExpiredCookies();
    if (clearedCount > 0) {
      toast.info(
        `Cleared ${clearedCount} expired cookie${clearedCount > 1 ? "s" : ""}`,
      );
    }
  }, [clearExpiredCookies]);

  const filteredCookies = filterDomain
    ? cookies.filter((c) =>
        c.domain.toLowerCase().includes(filterDomain.toLowerCase()),
      )
    : cookies;

  const handleSubmit = () => {
    if (!formData.key || !formData.domain) {
      toast.error("Name and Domain are required");
      return;
    }

    if (editingCookie) {
      updateCookie(editingCookie, {
        key: formData.key || "",
        value: formData.value || "",
        domain: formData.domain || "",
        path: formData.path || "/",
        expires: formData.expires,
        secure: formData.secure,
        httpOnly: formData.httpOnly,
      });
    } else {
      addCookie({
        key: formData.key || "",
        value: formData.value || "",
        domain: formData.domain || "",
        path: formData.path || "/",
        expires: formData.expires,
        secure: formData.secure,
        httpOnly: formData.httpOnly,
      });
    }

    resetForm();
    setIsDialogOpen(false);
    toast.success(editingCookie ? "Cookie updated" : "Cookie added");
  };

  const resetForm = () => {
    setFormData({
      key: "",
      value: "",
      domain: "",
      path: "/",
      secure: false,
      httpOnly: false,
    });
    setEditingCookie(null);
  };

  const handleEdit = (cookie: Cookie) => {
    setEditingCookie(cookie);
    setFormData(cookie);
    setIsDialogOpen(true);
  };

  const handleDelete = (domain: string, key: string) => {
    removeCookie(domain, key);
    toast.success("Cookie deleted");
  };

  const handleClearAll = () => {
    setIsClearDialogOpen(true);
  };

  const confirmClearAll = () => {
    clearCookies();
    toast.success("All cookies cleared");
    setIsClearDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Info Alert */}
      <div className="mx-4 mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
        <div className="size-5 rounded-md bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <svg
            className="size-3 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-label="test"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
            Local Storage Only
          </p>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5">
            Cookies are stored in your browser&apos;s local state and are not
            persisted to the database. They will be cleared when you logout.
            Expired cookies are automatically removed on visit.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Filter by domain..."
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="w-64 h-9 pl-9 rounded-lg bg-muted/50 border-border/50"
            />
            {filterDomain && (
              <button
                type="button"
                onClick={() => setFilterDomain("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
              >
                <X className="size-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Cookie count */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {cookies.length} cookies
            </span>
            {filterDomain && filteredCookies.length !== cookies.length && (
              <span className="text-xs text-muted-foreground">
                {filteredCookies.length} shown
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={cookies.length === 0}
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
          >
            <Trash2 className="size-4 mr-1.5" />
            Clear All
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Plus className="size-4 mr-1.5" />
            Add Cookie
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {filteredCookies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16">
            {/* Playful empty state */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-linear-to-br from-amber-500/20 to-orange-500/20 rounded-3xl blur-2xl" />
              <div className="relative size-20 rounded-2xl bg-linear-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 flex items-center justify-center">
                <Sparkles className="size-8 text-amber-500/50" />
              </div>
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              No Cookies Yet
            </h3>
            <p className="text-xs text-muted-foreground text-center max-w-[280px]">
              {cookies.length === 0
                ? "Cookies from API responses will appear here. You can also add cookies manually."
                : "No cookies match your filter. Try a different search term."}
            </p>
            {cookies.length === 0 && (
              <Button
                type="button"
                size="sm"
                className="mt-4 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="size-4 mr-1.5" />
                Add Your First Cookie
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCookies.map((cookie, index) => (
              <CookieCard
                key={`${cookie.domain}-${cookie.key}-${index?.toString()}`}
                cookie={cookie}
                onEdit={() => handleEdit(cookie)}
                onDelete={() => handleDelete(cookie.domain, cookie.key)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Cookie Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <CookieIcon className="size-5 text-amber-500" />
              </div>
              <div>
                <DialogTitle>
                  {editingCookie ? "Edit Cookie" : "Add Cookie"}
                </DialogTitle>
                <DialogDescription>
                  {editingCookie
                    ? "Modify the cookie details below."
                    : "Create a new cookie."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name & Domain */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label
                  htmlFor="cookie-name"
                  className="text-xs font-medium text-foreground"
                >
                  Name *
                </label>
                <Input
                  id="cookie-name"
                  placeholder="cookie_name"
                  value={formData.key || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      key: e.target.value,
                    })
                  }
                  className="h-9 font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="cookie-domain"
                  className="text-xs font-medium text-foreground"
                >
                  Domain *
                </label>
                <Input
                  id="cookie-domain"
                  placeholder="example.com"
                  value={formData.domain || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      domain: e.target.value,
                    })
                  }
                  className="h-9 font-mono text-xs"
                />
              </div>
            </div>

            {/* Value */}
            <div className="space-y-2">
              <label
                htmlFor="cookie-value"
                className="text-xs font-medium text-foreground"
              >
                Value
              </label>
              <Input
                id="cookie-value"
                placeholder="cookie_value"
                value={formData.value || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    value: e.target.value,
                  })
                }
                className="h-9 font-mono text-xs"
              />
            </div>

            {/* Path & Expires */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label
                  htmlFor="cookie-path"
                  className="text-xs font-medium text-foreground"
                >
                  Path
                </label>
                <Input
                  id="cookie-path"
                  placeholder="/"
                  value={formData.path || "/"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      path: e.target.value,
                    })
                  }
                  className="h-9 font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="cookie-expires"
                  className="text-xs font-medium text-foreground"
                >
                  Expires
                </label>
                <Input
                  id="cookie-expires"
                  type="datetime-local"
                  value={formData.expires || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expires: e.target.value,
                    })
                  }
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Flags */}
            <div className="flex items-center gap-6 pt-2">
              <label
                htmlFor="secure"
                className="flex items-center gap-2 cursor-pointer group"
              >
                <Checkbox
                  id="secure"
                  checked={formData.secure || false}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      secure: Boolean(checked),
                    })
                  }
                />
                <span className="flex items-center gap-1.5 text-sm">
                  <Lock className="size-3 text-emerald-500" />
                  Secure
                </span>
              </label>
              <label
                htmlFor="httpOnly"
                className="flex items-center gap-2 cursor-pointer group"
              >
                <Checkbox
                  id="httpOnly"
                  checked={formData.httpOnly || false}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      httpOnly: Boolean(checked),
                    })
                  }
                />
                <span className="flex items-center gap-1.5 text-sm">
                  <Shield className="size-3 text-blue-500" />
                  HttpOnly
                </span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {editingCookie ? "Update Cookie" : "Add Cookie"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all cookies?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove all cookies for the current workspace from
              your local storage. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CookieManager;
