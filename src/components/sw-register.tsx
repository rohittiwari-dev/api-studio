"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Excluded routes that should not be accessible in PWA
const _PWA_EXCLUDED_ROUTES = ["/", "/docs"];

// Check if a path is an excluded route
function isExcludedRoute(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/docs");
}

// Check if running in standalone PWA mode
function checkIsStandalone(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

// PWA Context
interface PWAContextType {
  isPWA: boolean;
  isExcludedRoute: (path: string) => boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  promptToInstall: () => Promise<void>;
  /** True when a newer service worker is waiting — show "Update available" UI */
  updateAvailable: boolean;
  /** Call this to apply the pending SW update and reload */
  applyUpdate: () => void;
  /** True when the install prompt is ready to show */
  canInstall: boolean;
}

const PWAContext = createContext<PWAContextType>({
  isPWA: false,
  isExcludedRoute: () => false,
  deferredPrompt: null,
  promptToInstall: async () => {},
  updateAvailable: false,
  applyUpdate: () => {},
  canInstall: false,
});

export const usePWA = () => useContext(PWAContext);

export function ServiceWorkerRegistration({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [isPWA, setIsPWA] = useState(() => checkIsStandalone());
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const hasRedirected = useRef(false);
  // Hold a ref to the waiting SW so we can send it SKIP_WAITING
  const waitingWorker = useRef<ServiceWorker | null>(null);

  const getRedirectUrl = useCallback(() => {
    const hasSession = document.cookie.includes("better-auth.session_token");
    return hasSession ? "/workspace" : "/sign-in";
  }, []);

  // Listen for display-mode changes (handles install transition)
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(display-mode: standalone)");

    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      const isNowStandalone = e.matches;
      setIsPWA(isNowStandalone);

      if (isNowStandalone && isExcludedRoute(window.location.pathname)) {
        window.location.replace(getRedirectUrl());
      }
    };

    mediaQuery.addEventListener("change", handleDisplayModeChange);

    // Capture beforeinstallprompt early to show custom install button
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    return () => {
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, [getRedirectUrl]);

  const promptToInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  /** Send SKIP_WAITING to the new SW and reload to activate it */
  const applyUpdate = useCallback(() => {
    if (waitingWorker.current) {
      waitingWorker.current.postMessage({ type: "SKIP_WAITING" });
    }
    // Reload after a short delay so the new SW can activate
    setTimeout(() => window.location.reload(), 300);
  }, []);

  // Handle PWA mode setup and route protection
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (isPWA) {
      // biome-ignore lint/suspicious/noDocumentCookie: Required to set PWA mode server-readable state
      document.cookie = "pwa-display-mode=standalone; path=/; max-age=31536000";
      sessionStorage.setItem("pwa-mode", "true");

      if (isExcludedRoute(window.location.pathname) && !hasRedirected.current) {
        hasRedirected.current = true;
        window.location.replace(getRedirectUrl());
        return;
      }

      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest("a");

        if (link) {
          const href = link.getAttribute("href");
          if (href && isExcludedRoute(href)) {
            e.preventDefault();
            e.stopPropagation();
          }
        }
      };

      const handlePopState = () => {
        if (isExcludedRoute(window.location.pathname)) {
          window.history.pushState(null, "", getRedirectUrl());
          window.location.replace(getRedirectUrl());
        }
      };

      document.addEventListener("click", handleClick, true);
      window.addEventListener("popstate", handlePopState);

      return () => {
        document.removeEventListener("click", handleClick, true);
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      // biome-ignore lint/suspicious/noDocumentCookie: Required to set PWA mode server-readable state
      document.cookie = "pwa-display-mode=browser; path=/; max-age=31536000";
      sessionStorage.removeItem("pwa-mode");
    }
  }, [isPWA, getRedirectUrl]);

  // Register service worker and watch for updates
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Check for an already-waiting worker on first load
        if (registration.waiting) {
          waitingWorker.current = registration.waiting;
          setUpdateAvailable(true);
        }

        // A new SW was found while the page is open
        registration.onupdatefound = () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.onstatechange = () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New content is available — notify the user
              waitingWorker.current = registration.waiting;
              setUpdateAvailable(true);
            }
          };
        };
      })
      .catch((error) => {
        console.warn("SW registration failed:", error);
      });

    // When the SW controller changes (after SKIP_WAITING), reload is triggered
    // by applyUpdate(), so nothing extra needed here.
  }, []);

  if (
    isPWA &&
    typeof window !== "undefined" &&
    isExcludedRoute(window.location.pathname)
  ) {
    return null;
  }

  return (
    <PWAContext.Provider
      value={{
        isPWA,
        isExcludedRoute,
        deferredPrompt,
        promptToInstall,
        updateAvailable,
        applyUpdate,
        canInstall: deferredPrompt !== null,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}
