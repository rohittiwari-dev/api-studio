"use client";

import { Check, Copy, Database, Globe, Network, Server } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const INSTALLATION_METHODS = {
  docker: [
    {
      num: "01",
      title: "Clone Repository",
      cmd: "git clone https://github.com/rohittiwari-dev/api-client.git",
    },
    {
      num: "02",
      title: "Change Directory",
      cmd: "cd api-client",
    },
    {
      num: "03",
      title: "Start Services",
      cmd: "docker compose up -d",
    },
  ],
  manual: [
    {
      num: "01",
      title: "Clone Repository",
      cmd: "git clone https://github.com/rohittiwari-dev/api-client.git",
    },
    {
      num: "02",
      title: "Install Dependencies",
      cmd: "npm install",
    },
    {
      num: "03",
      title: "Start Server",
      cmd: "npm run dev",
    },
  ],
};

// Abstract 3D Server Stack Animation
function ServerGraphics() {
  return (
    <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden group perspective-[1200px] flex items-center justify-center">
      {/* Ambient central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(20,184,166,0.15)_0%,transparent_60%)] group-hover:bg-[radial-gradient(circle,rgba(20,184,166,0.25)_0%,transparent_60%)] transition-colors duration-1000" />

      {/* Grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_100%_100%_at_50%_50%,#000_40%,transparent_100%)]" />

      {/* Server Rack Container */}
      <motion.div
        animate={{ rotateY: [-5, 5, -5], rotateX: [2, -2, 2] }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="relative z-20 flex flex-col gap-4 transform-style-preserve-3d"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Server Node 1 (Proxy/Router) */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="w-64 h-20 rounded-xl bg-black/80 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_-5px_rgba(20,184,166,0.3)] flex items-center px-6 relative overflow-hidden"
          style={{ transform: "translateZ(60px)" }}
        >
          {/* Status Lights */}
          <div className="flex flex-col gap-1.5 mr-6">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_0_rgba(45,212,191,0.8)] animate-pulse" />
            <div
              className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_0_rgba(45,212,191,0.8)] animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>
          <div className="flex-1 border-l border-white/10 pl-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[10px] font-bold text-white/90 font-mono tracking-wider">
                PROXY ROUTER
              </span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="h-full w-1/3 bg-teal-400"
              />
            </div>
          </div>
          {/* Decorative grill */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)]" />
        </motion.div>

        {/* Server Node 2 (App Engine) */}
        <motion.div
          animate={{ y: [5, -5, 5] }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
          className="w-64 h-20 rounded-xl bg-black/80 border border-white/10 backdrop-blur-xl shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] flex items-center px-6 relative overflow-hidden"
          style={{ transform: "translateZ(80px)" }}
        >
          <div className="flex flex-col gap-1.5 mr-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_0_rgba(96,165,250,0.8)] animate-pulse" />
            <div
              className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_0_rgba(96,165,250,0.8)] animate-pulse"
              style={{ animationDelay: "0.5s" }}
            />
          </div>
          <div className="flex-1 border-l border-white/10 pl-4">
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold text-white/90 font-mono tracking-wider">
                APP ENGINE
              </span>
            </div>
            <div className="text-[8px] text-white/40 font-mono">
              Running: api-studio-client
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)]" />
        </motion.div>

        {/* Server Node 3 (Database) */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{
            duration: 4.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
          className="w-64 h-20 rounded-xl bg-black/80 border border-white/10 backdrop-blur-xl flex items-center px-6 relative overflow-hidden shadow-xl"
          style={{ transform: "translateZ(40px)" }}
        >
          <div className="flex flex-col gap-1.5 mr-6">
            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_10px_0_rgba(232,121,249,0.8)] animate-pulse" />
          </div>
          <div className="flex-1 border-l border-white/10 pl-4">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-3.5 h-3.5 text-fuchsia-400" />
              <span className="text-[10px] font-bold text-white/90 font-mono tracking-wider">
                DATABASE
              </span>
            </div>
            <div className="text-[8px] text-white/40 font-mono">Sync: OK</div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)]" />
        </motion.div>
      </motion.div>

      {/* Floating UI Callout */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{
          duration: 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute top-10 right-4 lg:right-10 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl p-4 shadow-2xl z-40"
        style={{ transform: "translateZ(120px)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
            <Check className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white/90">
              Self-Hosted
            </div>
            <div className="text-[9px] text-teal-400">Environment Active</div>
          </div>
        </div>
      </motion.div>

      {/* Animated Vertical Cables in background */}
      <div className="absolute inset-x-1/2 top-0 bottom-0 -ml-24 w-48 flex justify-between z-10 pointer-events-none opacity-20">
        <div className="w-px h-full bg-linear-to-b from-teal-500/0 via-teal-500 to-teal-500/0" />
        <div className="w-px h-full bg-linear-to-b from-blue-500/0 via-blue-500 to-blue-500/0" />
        <div className="w-px h-full bg-linear-to-b from-teal-500/0 via-teal-500 to-teal-500/0" />
      </div>

      {/* Data Packets traveling up and down */}
      <motion.div
        animate={{ top: ["100%", "-10%"] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        className="absolute left-[calc(50%-6rem)] w-1 h-8 bg-teal-400 shadow-[0_0_10px_2px_rgba(45,212,191,0.5)] z-20 rounded-full blur-[1px]"
      />
      <motion.div
        animate={{ top: ["-10%", "100%"] }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          delay: 0.5,
        }}
        className="absolute left-[calc(50%+6rem)] w-1 h-8 bg-blue-400 shadow-[0_0_10px_2px_rgba(96,165,250,0.5)] z-20 rounded-full blur-[1px]"
      />
    </div>
  );
}

export default function SelfHosting() {
  const [activeTab, setActiveTab] = useState<"docker" | "manual">("docker");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="py-32 lg:py-40 relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 mb-8 backdrop-blur-sm -ml-1">
              <Server className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-medium bg-linear-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent ml-1">
                Total Ownership
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-foreground tracking-tight leading-[1.05]">
              Your Data.{" "}
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-2 bg-linear-to-r from-teal-600/20 to-blue-600/20 blur-xl rounded-full opacity-50" />
                <span className="relative bg-linear-to-r from-teal-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Your Rules.
                </span>
              </span>
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-lg font-light">
              Keep full control of your API testing environment. Deploy Api
              Studio on your own infrastructure with zero hidden telemetry and
              zero vendor lock-in.
            </p>

            {/* Interactive Terminal Cards */}
            <div className="w-full space-y-6">
              {/* Tab Selection */}
              <div className="flex p-1 rounded-xl bg-white/[0.02] border border-white/5 w-fit backdrop-blur-sm shadow-inner">
                <button
                  type="button"
                  onClick={() => setActiveTab("docker")}
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 ${
                    activeTab === "docker"
                      ? "text-white shadow-xl"
                      : "text-muted-foreground/60 hover:text-white"
                  }`}
                >
                  {activeTab === "docker" && (
                    <motion.div
                      layoutId="activeTabHosting"
                      className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Server className="w-4 h-4" /> Docker
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("manual")}
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2.5 ${
                    activeTab === "manual"
                      ? "text-white shadow-xl"
                      : "text-muted-foreground/60 hover:text-white"
                  }`}
                >
                  {activeTab === "manual" && (
                    <motion.div
                      layoutId="activeTabHosting"
                      className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Network className="w-4 h-4" /> Node.js
                  </span>
                </button>
              </div>

              {/* Code Steps */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {INSTALLATION_METHODS[activeTab].map((step, index) => (
                      <motion.div
                        key={step.num}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative"
                      >
                        <div
                          className={`absolute -inset-0.5 bg-linear-to-r ${index === 2 ? "from-teal-500/20 to-blue-500/20" : "from-white/5 to-white/5"} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`}
                        />
                        <div className="relative flex items-center gap-4 p-4 rounded-xl bg-card/60 backdrop-blur-md border border-white/10 group-hover:border-white/20 transition-all shadow-sm">
                          <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-black/50 text-xs font-bold text-white/40 font-mono shadow-inner border border-white/5">
                            {step.num}
                          </div>

                          <div className="flex-1 min-w-0 pr-4">
                            <div className="text-[10px] font-semibold text-muted-foreground/60 mb-1.5 uppercase tracking-wider">
                              {step.title}
                            </div>
                            <code className="block text-[13px] font-mono text-white/90 truncate">
                              <span className="text-teal-400 mr-2">$</span>
                              {step.cmd}
                            </code>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyCommand(step.cmd, index)}
                            className="p-2.5 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white shrink-0 border border-transparent hover:border-white/10"
                            title="Copy command"
                          >
                            {copiedIndex === index ? (
                              <Check className="w-4 h-4 text-teal-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Connecting Line between steps */}
                        {index !==
                          INSTALLATION_METHODS[activeTab].length - 1 && (
                          <div className="absolute left-[36px] bottom-0 translate-y-full w-px h-4 bg-white/10 -z-10" />
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 perspective-[2000px]"
          >
            <motion.div
              whileHover={{ rotateY: 5, rotateX: -5 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative w-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              <ServerGraphics />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
