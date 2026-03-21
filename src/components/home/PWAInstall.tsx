"use client";

import { Check, Download, Monitor, Smartphone, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useSyncExternalStore } from "react";

import { usePWA } from "@/components/sw-register";

const subscribe = (callback: () => void) => {
  const query = window.matchMedia("(display-mode: standalone)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};

const getSnapshot = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
};

const getServerSnapshot = () => false;

// Floating 3D Device Mockups Graphic
function PWAGraphics() {
  return (
    <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden group perspective-[1200px] flex items-center justify-center">
      {/* Ambient central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-violet-500/20 rounded-full blur-[80px] group-hover:bg-violet-500/30 transition-colors duration-1000" />
      <div className="absolute top-[40%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-indigo-500/20 rounded-full blur-[60px]" />

      {/* Grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_100%_100%_at_50%_50%,#000_40%,transparent_100%)]" />

      {/* Floating Desktop Window */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotateY: [5, -5, 5] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute inset-x-8 lg:inset-x-12 top-12 bottom-20 rounded-xl bg-black/80 border border-white/10 backdrop-blur-2xl shadow-2xl z-20 flex flex-col overflow-hidden"
        style={{ transform: "translateZ(40px)" }}
      >
        {/* Mac window header */}
        <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded bg-white/5 text-[9px] font-mono text-white/40">
              api-studio - workspace
            </div>
          </div>
        </div>
        {/* Window Body Mockup */}
        <div className="flex-1 p-4 md:p-6 flex flex-col gap-4">
          <div className="h-6 w-1/3 rounded bg-white/10" />
          <div className="grid grid-cols-4 gap-4 flex-1">
            <div className="col-span-1 border border-white/5 rounded-lg bg-white/[0.02]" />
            <div className="col-span-3 border border-white/5 rounded-lg bg-white/[0.02]" />
          </div>
        </div>
      </motion.div>

      {/* Floating Phone Model */}
      <motion.div
        animate={{
          y: [15, -15, 15],
          rotateZ: [-2, 2, -2],
          rotateY: [-10, -5, -10],
        }}
        transition={{
          duration: 7,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute right-4 bottom-4 lg:right-8 lg:-bottom-4 w-32 md:w-40 rounded-[28px] bg-black border-4 border-gray-800 shadow-[0_0_50px_-10px_rgba(139,92,246,0.3)] z-30 overflow-hidden"
        style={{ transform: "translateZ(80px)", aspectRatio: "9/19" }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-gray-800 rounded-b-xl z-10" />
        {/* Screen Content */}
        <div className="h-full w-full bg-[#0a0a0a] border border-white/5 pt-8 p-3 space-y-3">
          <div className="h-8 w-full rounded bg-violet-500/20 border border-violet-500/30" />
          <div className="h-12 w-full rounded bg-white/5" />
          <div className="h-12 w-full rounded bg-white/5" />
          <div className="h-12 w-full rounded bg-white/5" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-white/20 rounded-full" />
        </div>
      </motion.div>

      {/* Floating Install App Icon Panel */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute -top-6 -right-6 md:top-4 md:-right-8 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl p-4 shadow-2xl z-40"
        style={{ transform: "translateZ(100px)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white/90">PWA Ready</div>
            <div className="text-[10px] text-violet-400">Install locally</div>
          </div>
        </div>
      </motion.div>

      {/* Install Ray sweep */}
      <motion.div
        animate={{ left: ["-100%", "200%"] }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          repeatDelay: 2,
        }}
        className="absolute top-0 bottom-0 w-[20%] bg-linear-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] z-50 pointer-events-none mix-blend-overlay"
      />
    </div>
  );
}

export default function PWAInstall() {
  const { deferredPrompt, promptToInstall } = usePWA();
  const [userInstalled, setUserInstalled] = useState(false);

  const isStandalone = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const isInstalled = isStandalone || userInstalled;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await promptToInstall();
    setUserInstalled(true);
  };

  return (
    <section className="py-32 lg:py-40 relative overflow-hidden bg-background">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 mb-8 backdrop-blur-sm -ml-1">
              <Monitor className="w-4 h-4 text-violet-400" />
              <Smartphone className="w-4 h-4 text-indigo-400 -ml-1" />
              <span className="text-sm font-medium bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent ml-1">
                Native Experience
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-foreground tracking-tight leading-[1.05]">
              Install as a{" "}
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-2 bg-linear-to-r from-violet-600/20 to-indigo-600/20 blur-xl rounded-full opacity-50" />
                <span className="relative bg-linear-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                  Native App
                </span>
              </span>
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-lg font-light">
              Get the full desktop client experience without the bloat. Install
              Api Studio directly to your dock or home screen for offline
              support, zero-latency performance, and keyboard shortcuts.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center md:justify-start">
              <AnimatePresence mode="wait">
                {!isInstalled ? (
                  <motion.button
                    key="install"
                    onClick={handleInstallClick}
                    disabled={!deferredPrompt}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className={`h-14 px-8 rounded-xl font-semibold text-base flex items-center gap-3 transition-all ${
                      deferredPrompt
                        ? "bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-[0_0_30px_-5px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_-5px_rgba(139,92,246,0.6)] border border-violet-500/50 cursor-pointer"
                        : "bg-muted/50 border border-border/50 text-muted-foreground/50 cursor-not-allowed opacity-80"
                    }`}
                  >
                    <Download className="w-5 h-5" />
                    {deferredPrompt
                      ? "Install Locally"
                      : "Install Not Available"}
                  </motion.button>
                ) : (
                  <motion.div
                    key="installed"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-14 px-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-3 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]"
                  >
                    <Check className="w-5 h-5" />
                    App is Installed
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80 px-4 py-2 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Instant Load Time</span>
              </div>
            </div>

            {!deferredPrompt && !isInstalled && (
              <p className="text-[11px] text-muted-foreground/40 mt-6 font-mono">
                * Requires a supported browser (Chrome, Edge, Android) to
                install.
              </p>
            )}
          </motion.div>

          {/* Right: Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 perspective-[2000px]"
          >
            <motion.div
              whileHover={{ rotateY: -5, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative w-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              <PWAGraphics />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
