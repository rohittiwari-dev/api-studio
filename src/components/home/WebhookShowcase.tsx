"use client";

import { Activity, Globe, Radio, Server } from "lucide-react";
import { motion } from "motion/react";

export default function WebhookShowcase() {
  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Radio className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-500">
                New Feature
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
              Debug Webhooks like a{" "}
              <span className="bg-linear-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Pro
              </span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Stop guessing what your webhooks are doing. Create unique
              endpoints instantly, inspect payloads in real-time, and mock
              responses to test your integrations thoroughly.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: Globe,
                  title: "Instant Endpoints",
                  description:
                    "Generate a unique URL with one click. No server setup required.",
                },
                {
                  icon: Activity,
                  title: "Real-time Inspector",
                  description:
                    "Watch requests arrive as they happen. Inspect headers, body, and query params.",
                },
                {
                  icon: Server,
                  title: "Mock Responses",
                  description:
                    "Configure custom status codes and bodies to test how your app handles errors.",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Graphic/Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl border border-border bg-card/50 shadow-2xl overflow-hidden backdrop-blur-sm">
              {/* Window Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 text-xs font-mono text-muted-foreground">
                  webhook-inspector
                </div>
              </div>

              {/* Webhook List Simulation */}
              <div className="p-6 space-y-4">
                {/* Simulated Incoming Request 1 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-lg border border-border bg-background p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-500">
                        POST
                      </span>
                      <span className="text-sm font-mono text-muted-foreground">
                        /hooks/stripe-payment
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Just now
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex text-xs font-mono">
                      <span className="text-purple-400 w-20">event_type:</span>
                      <span className="text-green-400">
                        &quot;payment_succeeded&quot;
                      </span>
                    </div>
                    <div className="flex text-xs font-mono">
                      <span className="text-purple-400 w-20">amount:</span>
                      <span className="text-orange-400">4900</span>
                    </div>
                    <div className="flex text-xs font-mono">
                      <span className="text-purple-400 w-20">currency:</span>
                      <span className="text-green-400">&quot;usd&quot;</span>
                    </div>
                  </div>
                </motion.div>

                {/* Simulated Incoming Request 2 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5 }}
                  className="rounded-lg border border-border bg-background p-4 shadow-sm opacity-60"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/10 text-green-500">
                        POST
                      </span>
                      <span className="text-sm font-mono text-muted-foreground">
                        /hooks/github-push
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      2 mins ago
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex text-xs font-mono">
                      <span className="text-purple-400 w-20">ref:</span>
                      <span className="text-green-400">
                        &quot;refs/heads/main&quot;
                      </span>
                    </div>
                    <div className="flex text-xs font-mono">
                      <span className="text-purple-400 w-20">pusher:</span>
                      <span className="text-green-400">
                        &quot;rohittiwari-dev&quot;
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Simulated Pulse Effect */}
                <div className="absolute top-6 right-6">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative Grid */}
            <div className="absolute -z-10 -bottom-10 -right-10 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
