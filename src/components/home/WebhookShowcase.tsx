"use client";

import { Activity, Globe, Radio, Server } from "lucide-react";
import { motion } from "motion/react";

export default function WebhookShowcase() {
  return (
    <section className="py-32 lg:py-40 relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center max-w-7xl mx-auto">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <Radio className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-500">
                Real-time Debugging
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight leading-[1.1]">
              Debug Webhooks{" "}
              <span className="bg-linear-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                in real-time
              </span>
            </h2>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
              Create unique endpoints instantly, inspect payloads live, and mock
              responses to test your integrations end-to-end.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: Globe,
                  title: "Instant Endpoints",
                  description:
                    "Generate a unique URL with one click. No server setup needed.",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                  border: "border-blue-500/20",
                },
                {
                  icon: Activity,
                  title: "Live Inspector",
                  description:
                    "Watch requests arrive in real-time. Inspect headers, body, and params.",
                  color: "text-violet-500",
                  bg: "bg-violet-500/10",
                  border: "border-violet-500/20",
                },
                {
                  icon: Server,
                  title: "Mock Responses",
                  description:
                    "Configure custom status codes and bodies to test error handling.",
                  color: "text-indigo-500",
                  bg: "bg-indigo-500/10",
                  border: "border-indigo-500/20",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="group flex gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors -mx-4"
                >
                  <div
                    className={`shrink-0 w-11 h-11 rounded-xl ${item.bg} ${item.border} border flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Animated Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl border border-white/[0.08] bg-card/40 shadow-2xl shadow-black/20 overflow-hidden backdrop-blur-sm">
              {/* Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-muted/20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="ml-4 text-[10px] font-mono text-muted-foreground/50">
                  webhook-inspector
                </div>
                {/* Live indicator */}
                <div className="ml-auto flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-[10px] font-medium text-green-500/80">
                    Live
                  </span>
                </div>
              </div>

              {/* Webhook Events */}
              <div className="p-5 space-y-3">
                {/* Event 1 — slides in */}
                <motion.div
                  initial={{ opacity: 0, x: -20, scale: 0.97 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="rounded-xl border border-border/50 bg-background/60 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                        POST
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        /hooks/stripe-payment
                      </span>
                    </div>
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 }}
                      className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md font-medium"
                    >
                      200 OK
                    </motion.span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex">
                      <span className="text-purple-400 w-20 shrink-0">
                        event:
                      </span>
                      <span className="text-green-400">
                        &quot;payment_succeeded&quot;
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-purple-400 w-20 shrink-0">
                        amount:
                      </span>
                      <span className="text-orange-400">4900</span>
                    </div>
                    <div className="flex">
                      <span className="text-purple-400 w-20 shrink-0">
                        currency:
                      </span>
                      <span className="text-green-400">&quot;usd&quot;</span>
                    </div>
                  </div>
                </motion.div>

                {/* Event 2 — slides in after delay */}
                <motion.div
                  initial={{ opacity: 0, x: -20, scale: 0.97 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  className="rounded-xl border border-border/50 bg-background/60 p-4 shadow-sm opacity-70"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                        POST
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        /hooks/github-push
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60">
                      2s ago
                    </span>
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div className="flex">
                      <span className="text-purple-400 w-20 shrink-0">
                        ref:
                      </span>
                      <span className="text-green-400">
                        &quot;refs/heads/main&quot;
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-purple-400 w-20 shrink-0">
                        pusher:
                      </span>
                      <span className="text-green-400">
                        &quot;rohittiwari-dev&quot;
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Pulse bar — simulated incoming */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.8 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border/40 text-muted-foreground/40"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="w-2 h-2 rounded-full bg-blue-500/40"
                  />
                  <span className="text-[11px] font-mono">
                    Waiting for next event...
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
            <div className="absolute -z-10 -top-10 -left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
