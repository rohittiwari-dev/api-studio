"use client";

import {
  Code2,
  Cookie,
  FolderOpen,
  Sparkles,
  Variable,
  Zap,
} from "lucide-react";
import { motion, useMotionValue } from "motion/react";
import type React from "react";

function FeatureCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-md shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/5 ${className}`}
    >
      {/* Spotlight Hover Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 mix-blend-plus-lighter"
        style={{
          background: useMotionValue(
            `radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(139, 92, 246, 0.08), transparent 80%)`,
          ),
        }}
      />

      <div className="relative z-10 flex h-full flex-col p-6 md:p-8">
        {children}
      </div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 lg:py-32 relative overflow-hidden bg-background"
    >
      {/* Clean background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary tracking-wide">
              Built for Developers
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight"
          >
            Everything you need to <br />
            <span className="bg-linear-to-r from-violet-600 via-purple-600 to-pink-600 dark:from-violet-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              build faster
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            A complete workspace designed for the modern API workflow. From
            request construction to automated code generation, every detail is
            crafted for speed.
          </motion.p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 max-w-7xl mx-auto">
          {/* Main Focus: Request Builder (Spans 4 columns) */}
          <FeatureCard className="md:col-span-4" delay={0}>
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-xs">
                <Zap className="w-5 h-5 text-violet-500" />
              </div>
              <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-violet-500/10 text-violet-500 border border-violet-500/20">
                Core Engine
              </div>
            </div>

            <h3 className="text-2xl lg:text-3xl font-bold mb-3 text-foreground tracking-tight">
              Advanced Request Builder
            </h3>
            <p className="text-muted-foreground mb-10 max-w-xl text-base leading-relaxed">
              Craft complex HTTP requests with absolute precision. Supports
              multiple body formats (JSON, FormData, URL-encoded), custom
              headers, query params validation, and instant context mapping.
            </p>

            {/* Clean UI Mockup inside card */}
            <div className="mt-auto relative rounded-xl border border-border bg-background/50 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center border-b border-border bg-muted/30 px-4 py-2.5 gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border/80" />
                </div>
                <div className="flex items-center gap-2 bg-background border border-border rounded px-2 py-1 flex-1 max-w-xs shadow-xs">
                  <span className="text-[10px] font-bold text-green-500">
                    POST
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground truncate">
                    https://api.stripe.com/v1/charges
                  </span>
                </div>
              </div>

              <div className="p-5 font-mono text-xs md:text-sm overflow-x-auto text-foreground/80 leading-relaxed bg-muted/10">
                <div className="flex gap-4">
                  <span className="text-muted-foreground">Authorization</span>
                  <span className="text-blue-500">
                    Bearer {"{{SECRET_KEY}}"}
                  </span>
                </div>
                <div className="flex gap-4 mt-1">
                  <span className="text-muted-foreground">Content-Type</span>
                  <span className="text-orange-500">
                    application/x-www-form-urlencoded
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-violet-500">amount</span>=2000&
                  <span className="text-violet-500">currency</span>=usd&
                  <span className="text-violet-500">source</span>=
                  {"{{card_token}}"}
                </div>
              </div>
            </div>
          </FeatureCard>

          {/* Variables */}
          <FeatureCard className="md:col-span-2" delay={0.1}>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 shadow-xs">
              <Variable className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">
              Environment Variables
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Isolate your dev, stage, and production logic. Swap contexts
              easily and inject secrets without leaking them.
            </p>

            <div className="mt-auto px-4 py-3 rounded-lg bg-background border border-border shadow-xs flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">
                BASE_URL
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Production
              </span>
            </div>
          </FeatureCard>

          {/* Workspaces */}
          <FeatureCard className="md:col-span-2" delay={0.2}>
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6 shadow-xs">
              <FolderOpen className="w-5 h-5 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">
              Isolated Workspaces
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Boundaries for your projects. Keep collections, environments, and
              history entirely separate and organized.
            </p>
          </FeatureCard>

          {/* Cookies */}
          <FeatureCard className="md:col-span-2" delay={0.3}>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 shadow-xs">
              <Cookie className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">
              Cookie Management
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Automatic cookie jarring. Intercept, modify, and replay session
              cookies seamlessly between subsequent requests.
            </p>
          </FeatureCard>

          {/* Code Gen */}
          <FeatureCard className="md:col-span-2" delay={0.4}>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-xs">
              <Code2 className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">
              Code Generation
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              One click to export cURL, Node, Python, or Go. Turn your visual UI
              setups into production-ready code instantly.
            </p>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
