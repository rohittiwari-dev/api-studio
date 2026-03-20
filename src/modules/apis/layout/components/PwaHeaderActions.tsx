"use client";

import { usePWA } from "@/components/sw-register";

/**
 * PWA action buttons for the app header.
 *
 * - Shows an "Install App" button when the browser fires `beforeinstallprompt`
 * - Shows an "Update available" pill when a new service worker is waiting
 *
 * Both pills are styled to match the header's glassmorphism aesthetic.
 */
export function PwaHeaderActions() {
  const { canInstall, promptToInstall, updateAvailable, applyUpdate } =
    usePWA();

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Update available banner                                              */}
      {/* ------------------------------------------------------------------ */}
      {updateAvailable && (
        <button
          type="button"
          onClick={applyUpdate}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
            bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
            hover:bg-emerald-500/20 hover:border-emerald-500/30
            transition-all duration-200 cursor-pointer whitespace-nowrap"
          title="A new version is available. Click to reload and apply."
        >
          <span className="relative flex size-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
          </span>
          Update available
        </button>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Install button — only visible when browser allows install            */}
      {/* ------------------------------------------------------------------ */}
      {canInstall && !updateAvailable && (
        <button
          type="button"
          onClick={promptToInstall}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
            bg-violet-500/10 text-violet-400 border border-violet-500/20
            hover:bg-violet-500/20 hover:border-violet-500/30
            transition-all duration-200 cursor-pointer whitespace-nowrap"
          title="Install API Studio as a desktop app"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 17V3" />
            <path d="m6 11 6 6 6-6" />
            <path d="M19 21H5" />
          </svg>
          Install App
        </button>
      )}
    </>
  );
}
