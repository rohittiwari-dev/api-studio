"use client";

import { BrainCircuit, FileSearch, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const CAPABILITIES = [
  {
    icon: BrainCircuit,
    title: "Debug Responses",
    desc: "Explain status codes, headers, and error messages instantly.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "shadow-[0_0_30px_-5px_var(--color-violet-500)]",
  },
  {
    icon: FileSearch,
    title: "Analyze Requests",
    desc: "Review your request structure and suggest best practices.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "shadow-[0_0_30px_-5px_var(--color-blue-500)]",
  },
  {
    icon: Zap,
    title: "Quick Answers",
    desc: "Auth flows, headers, body formats in plain English.",
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500/20",
    glow: "shadow-[0_0_30px_-5px_var(--color-fuchsia-500)]",
  },
];

// Floating animated particles for the background
// Floating animated particles for the background
function FloatingParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {mounted &&
        [...Array(15)].map((_, i) => (
          <motion.div
            key={i?.toString()}
            className="absolute w-1 h-1 bg-violet-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100 - Math.random() * 100],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}
    </div>
  );
}

// Glowing beams cutting across the container
function Beams() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
      <motion.div
        animate={{
          x: ["-100%", "200%"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          repeatDelay: 1,
        }}
        className="absolute top-[20%] left-0 w-[200px] h-px bg-linear-to-r from-transparent via-violet-500 to-transparent blur-[1px]"
      />
      <motion.div
        animate={{
          x: ["200%", "-100%"],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          repeatDelay: 2,
        }}
        className="absolute top-[60%] right-0 w-[300px] h-px bg-linear-to-r from-transparent via-fuchsia-500 to-transparent blur-[1px]"
      />
    </div>
  );
}

// Complex neural-network style connecting nodes for the graphic
function NeuralNetworkGraphic() {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const nodes = [
    { x: 30, y: 30, label: "Request", color: "from-blue-500 to-cyan-500" },
    { x: 70, y: 20, label: "Analyzed", color: "from-violet-500 to-purple-500" },
    { x: 80, y: 70, label: "Response", color: "from-fuchsia-500 to-pink-500" },
    { x: 20, y: 60, label: "Headers", color: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="relative w-full aspect-square md:aspect-4/3 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden group">
      {/* Ambient central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-violet-500/20 rounded-full blur-[80px] group-hover:bg-violet-500/30 transition-colors duration-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-fuchsia-500/10 rounded-full blur-[60px]" />

      {/* Grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_100%_100%_at_50%_50%,#000_20%,transparent_100%)]" />

      {/* Center AI Brain */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-2xl bg-white/5 border border-white/20 backdrop-blur-xl flex items-center justify-center z-20 shadow-[0_0_50px_-10px_rgba(139,92,246,0.3)]"
        animate={{
          boxShadow: [
            "0 0 50px -10px rgba(139,92,246,0.3)",
            "0 0 80px -5px rgba(139,92,246,0.5)",
            "0 0 50px -10px rgba(139,92,246,0.3)",
          ],
        }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
      >
        <Sparkles className="w-10 h-10 text-violet-300" />
        {/* Inner rotating rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute inset-[-10px] rounded-3xl border border-violet-500/30 border-t-violet-400"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute inset-[-20px] rounded-[32px] border border-fuchsia-500/20 border-b-fuchsia-400"
        />
      </motion.div>

      {/* Connecting Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        aria-label="Neural Network Connections"
      >
        {nodes.map((node, i) => (
          <motion.line
            key={`line-${node.label}`}
            x1="50%"
            y1="50%"
            x2={`${node.x}%`}
            y2={`${node.y}%`}
            stroke="url(#gradient-line)"
            strokeWidth="2"
            strokeDasharray="4 4"
            animate={{
              strokeOpacity:
                activeNode === i || activeNode === (i + 1) % 4 ? 0.8 : 0.1,
            }}
            transition={{ duration: 1 }}
          />
        ))}
        <defs>
          <linearGradient
            id="gradient-line"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="rgba(139,92,246,1)" />
            <stop offset="100%" stopColor="rgba(217,70,239,0)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.label}
          className="absolute w-12 h-12 -ml-6 -mt-6 rounded-xl border border-white/20 bg-black/60 backdrop-blur-md flex items-center justify-center z-20 shadow-xl"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          animate={{
            y: [0, -10, 0],
            scale: activeNode === i ? 1.1 : 1,
            borderColor:
              activeNode === i
                ? "rgba(139,92,246,0.8)"
                : "rgba(255,255,255,0.2)",
            boxShadow:
              activeNode === i ? "0 0 30px -5px rgba(139,92,246,0.4)" : "none",
          }}
          transition={{
            y: {
              duration: 3 + i,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            scale: { duration: 0.5 },
          }}
        >
          <div
            className={`w-6 h-6 rounded-full bg-linear-to-br ${node.color} opacity-80 blur-[2px]`}
          />
          <div className="absolute -bottom-7 whitespace-nowrap text-[10px] font-mono text-white/70 px-2 py-1 rounded bg-black/50 border border-white/10 backdrop-blur-sm">
            {node.label}
          </div>
        </motion.div>
      ))}

      {/* Data Packets traveling along lines */}
      {nodes.map((node, i) => (
        <motion.div
          key={`packet-${node.label}`}
          className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_10px_2px_#fff] z-30"
          animate={
            activeNode === i
              ? {
                  left: ["50%", `${node.x}%`],
                  top: ["50%", `${node.y}%`],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }
              : { opacity: 0 }
          }
          transition={{ duration: 1.5, ease: "circOut" }}
        />
      ))}

      {/* Ambient corner highlights */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-[50px] translate-x-1/3 translate-y-1/3" />
    </div>
  );
}

export default function AiShowcase() {
  return (
    <section className="py-32 lg:py-40 relative overflow-hidden bg-background">
      <FloatingParticles />
      <Beams />

      {/* Main Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(139,92,246,0.06)_0%,transparent_70%)]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(217,70,239,0.04)_0%,transparent_70%)]" />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 mb-8 backdrop-blur-sm shadow-[0_0_20px_-5px_rgba(139,92,246,0.2)]">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Gemini Intelligence
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-foreground tracking-tight leading-[1.05]">
              Meet your{" "}
              <span className="block mt-2 relative">
                <span className="absolute -inset-2 bg-linear-to-r from-violet-600/20 to-fuchsia-600/20 blur-xl rounded-full opacity-50" />
                <span className="relative bg-linear-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  API copilot
                </span>
              </span>
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-lg font-light">
              Stop Googling error codes. Get instant, context-aware explanations
              for status codes, auth flows, and complex request structures right
              inside your workspace.
            </p>

            <div className="space-y-4">
              {CAPABILITIES.map((cap, i) => (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                  className="group relative flex gap-5 p-5 rounded-2xl border border-white/3 bg-white/1 hover:bg-white/3 hover:border-white/8 transition-all duration-500 overflow-hidden"
                >
                  {/* Hover flare */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-1/2 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
                  </div>

                  <div
                    className={`shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center ${cap.bg} ${cap.border} group-hover:${cap.glow} transition-all duration-500 group-hover:scale-110`}
                  >
                    <cap.icon className={`w-5 h-5 ${cap.color}`} />
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-base font-semibold text-foreground/90 mb-1 tracking-tight">
                      {cap.title}
                    </h3>
                    <p className="text-sm text-muted-foreground/70 leading-relaxed font-light">
                      {cap.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Animated Neural Graphics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 perspective-[1000px]"
          >
            <motion.div
              whileHover={{ rotateY: -5, rotateX: 5 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative w-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              <NeuralNetworkGraphic />

              {/* Floating contextual UI elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute -right-6 lg:-right-12 top-20 rounded-xl bg-black/60 border border-white/10 backdrop-blur-xl p-4 shadow-2xl z-30"
                style={{ transform: "translateZ(50px)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <span className="text-red-400 font-bold text-xs">403</span>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white/90">
                      Forbidden Alert
                    </div>
                    <div className="text-[10px] text-white/50">
                      Analyzing scope headers...
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{
                  duration: 7,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -left-6 lg:-left-12 bottom-20 rounded-xl bg-black/60 border border-white/10 backdrop-blur-xl p-4 shadow-2xl z-30"
                style={{ transform: "translateZ(30px)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white/90">
                      Fix Identified
                    </div>
                    <div className="text-[10px] text-white/50">
                      Missing Bearer token format
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
