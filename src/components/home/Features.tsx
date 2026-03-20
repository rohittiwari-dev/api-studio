"use client";

import {
  Clock,
  Code2,
  Cookie,
  FolderOpen,
  Shield,
  Sparkles,
  Variable,
  Zap,
} from "lucide-react";
import { motion, useMotionValue, useTransform } from "motion/react";
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
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [3, -3]);
  const rotateY = useTransform(x, [-100, 100], [-3, 3]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      onMouseMove={(e) => {
        const rect = (e.target as HTMLElement)
          .closest("[data-card]")
          ?.getBoundingClientRect();
        if (!rect) return;
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      data-card
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 ${className}`}
    >
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-[-1px] rounded-2xl bg-linear-to-r from-violet-500/20 via-indigo-500/20 to-purple-500/20" />
      </div>

      {/* Spotlight effect */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(350px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(120,100,255,0.06),transparent_80%)]" />

      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section
      id="features"
      className="py-32 lg:py-40 relative overflow-hidden bg-background"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Built for Speed
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-foreground tracking-tight"
          >
            Everything you need to{" "}
            <span className="bg-linear-to-r from-violet-600 via-purple-600 to-pink-600 dark:from-violet-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              build faster
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground leading-relaxed"
          >
            A complete workspace designed for the modern API workflow. From
            request to response, every detail is crafted for speed.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 max-w-7xl mx-auto perspective-[2000px]">
          {/* Card 1: Request Builder — spans 4 cols */}
          <FeatureCard className="md:col-span-4 p-8 md:p-10" delay={0}>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-violet-500" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-violet-500/10 text-violet-500 border border-violet-500/20">
                Core Engine
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              Advanced Request Builder
            </h3>
            <p className="text-muted-foreground mb-8 max-w-lg text-sm leading-relaxed">
              Craft complex HTTP requests with ease. All methods, custom
              headers, query params, and multiple body types including JSON,
              FormData, and binary.
            </p>

            {/* Mini mockup */}
            <div className="rounded-xl border border-border/50 bg-background/80 shadow-lg overflow-hidden">
              <div className="flex items-center border-b border-border/50 bg-muted/20 px-4 py-2.5 gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400/60" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                  <div className="w-2 h-2 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 text-center text-[10px] font-mono text-muted-foreground/50">
                  api-studio
                </div>
              </div>
              <div className="p-4 flex gap-2">
                <div className="w-20 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-500">
                  GET
                </div>
                <div className="flex-1 h-9 rounded-lg bg-muted/30 border border-border/30 flex items-center px-3 text-xs font-mono text-muted-foreground/60">
                  https://api.stripe.com/v1/charges
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-9 rounded-lg bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold cursor-pointer"
                >
                  Send
                </motion.div>
              </div>
            </div>
          </FeatureCard>

          {/* Card 2: Auth — spans 2 cols */}
          <FeatureCard className="md:col-span-2 p-8" delay={0.1}>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">
              Robust Auth
            </h3>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              OAuth 2.0, Bearer, Basic, Digest, API Key — all built in with
              server-side handling.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["OAuth 2.0", "Bearer", "Basic", "Digest"].map((type, idx) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + idx * 0.08 }}
                  className="px-3 py-2.5 rounded-lg bg-background/60 border border-border/50 text-xs font-medium text-center hover:border-blue-500/30 hover:bg-blue-500/5 transition-colors"
                >
                  {type}
                </motion.div>
              ))}
            </div>
          </FeatureCard>

          {/* Card 3: Env Vars — spans 2 cols */}
          <FeatureCard className="md:col-span-2 p-8" delay={0.15}>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
              <Variable className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">
              Environments
            </h3>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Switch between Local, Staging, and Production seamlessly.
            </p>
            <div className="rounded-xl bg-gray-950 p-4 font-mono text-xs border border-gray-800/50">
              <div className="flex justify-between text-gray-500 mb-2">
                <span>BASE_URL</span>
                <span className="text-emerald-400">active</span>
              </div>
              <div className="text-amber-400 break-all">{"{{api_url}}"}</div>
            </div>
          </FeatureCard>

          {/* Card 4: Code Gen — spans 4 cols */}
          <FeatureCard className="md:col-span-4 p-8 md:p-10" delay={0.2}>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                  <Code2 className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  Instant Code Generation
                </h3>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  Turn any request into production-ready code. Support for
                  JavaScript, Python, Go, and 20+ languages.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["cURL", "Node.js", "Python", "Go", "PHP", "Java"].map(
                    (lang, idx) => (
                      <motion.span
                        key={lang}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + idx * 0.05 }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                      >
                        {lang}
                      </motion.span>
                    ),
                  )}
                </div>
              </div>

              <div className="w-full md:w-5/12 rounded-xl bg-gray-950 border border-gray-800/50 p-5 shadow-2xl">
                <div className="flex gap-1.5 mb-4 border-b border-gray-800/50 pb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                </div>
                <div className="font-mono text-xs space-y-1.5">
                  <div className="text-pink-400">
                    import <span className="text-white">requests</span>
                  </div>
                  <div className="text-gray-600 py-0.5" />
                  <div className="text-blue-300">response = requests.get(</div>
                  <div className="text-green-400 pl-4">
                    &apos;https://api.studio/v1/data&apos;
                  </div>
                  <div className="text-blue-300">)</div>
                </div>
              </div>
            </div>
          </FeatureCard>

          {/* Bottom 3 mini cards */}
          {[
            {
              title: "Real-time",
              desc: "WebSocket & SSE debugging",
              icon: Clock,
              color: "text-rose-500",
              bg: "bg-rose-500/10",
              border: "border-rose-500/20",
            },
            {
              title: "Collections",
              desc: "Organize with folders",
              icon: FolderOpen,
              color: "text-orange-500",
              bg: "bg-orange-500/10",
              border: "border-orange-500/20",
            },
            {
              title: "Cookies",
              desc: "Auto-manage cookies",
              icon: Cookie,
              color: "text-amber-500",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
            },
          ].map((item, i) => (
            <FeatureCard
              key={item.title}
              className="md:col-span-2 p-6 flex flex-col items-center text-center"
              delay={0.25 + i * 0.08}
            >
              <div
                className={`w-12 h-12 rounded-2xl ${item.bg} ${item.border} border flex items-center justify-center mb-4`}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  );
}
