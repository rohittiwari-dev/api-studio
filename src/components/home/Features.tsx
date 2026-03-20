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
import { motion } from "motion/react";

export default function Features() {
  return (
    <section
      id="features"
      className="py-32 relative overflow-hidden bg-background"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
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
              Unmatched Capabilities
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
            request to response, every detail is crafted for speed and clarity.
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto"
        >
          {/* Card 1: Request Builder (Large, span 2) */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -5 }}
            className="md:col-span-2 relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-linear-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-violet-500" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-500 border border-violet-500/20">
                  Core Engine
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">
                Advanced Request Builder
              </h3>
              <p className="text-muted-foreground mb-8 max-w-lg">
                Craft complex HTTP requests with ease. Support for all methods,
                custom headers, query parameters, and multiple body types
                including FormData and Binary.
              </p>

              {/* Mock UI for Request Builder */}
              <div className="relative rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                <div className="flex items-center border-b border-border bg-muted/30 px-4 py-2 gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 text-center text-xs font-mono text-muted-foreground">
                    api-client
                  </div>
                </div>
                <div className="p-4 grid gap-4">
                  <div className="flex gap-2">
                    <div className="w-20 h-9 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-500">
                      GET
                    </div>
                    <div className="flex-1 h-9 rounded bg-muted/50 border border-border/50 flex items-center px-3 text-xs font-mono text-muted-foreground">
                      https://api.stripe.com/v1/charges
                    </div>
                    <div className="w-16 h-9 rounded bg-primary flex items-center justify-center text-xs text-primary-foreground font-medium">
                      Send
                    </div>
                  </div>
                  <div className="flex gap-4 border-b border-border/50 pb-2">
                    <div className="text-xs font-medium text-foreground border-b-2 border-primary pb-2 px-1">
                      Params
                    </div>
                    <div className="text-xs font-medium text-muted-foreground px-1">
                      Headers
                    </div>
                    <div className="text-xs font-medium text-muted-foreground px-1">
                      Body
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Auth (Span 1) */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -5 }}
            className="relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">
                Robust Auth
              </h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Built-in support for OAuth 2.0, Bearer Tokens, Basic Auth, and
                more. Sensitive data is handled securely server-side.
              </p>
              <div className="mt-auto grid grid-cols-2 gap-2">
                {["OAuth 2.0", "Bearer", "Basic", "Digest"].map((type, idx) => (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{
                      delay: 0.5 + idx * 0.1,
                    }}
                    className="px-3 py-2 rounded-lg bg-background border border-border text-xs font-medium text-center"
                  >
                    {type}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 3: Env Vars (Span 1) */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -5 }}
            className="relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-linear-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6">
                <Variable className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">
                Environments
              </h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Switch between Local, Staging, and Prop seamlessly using
                variables.
              </p>
              <div className="rounded-lg bg-gray-950 p-4 font-mono text-xs border border-gray-800">
                <div className="flex justify-between text-gray-500 mb-2">
                  <span>BASE_URL</span>
                  <span className="text-green-400">active</span>
                </div>
                <div className="text-yellow-400 break-all">{"{{api_url}}"}</div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Code Gen (Large, Span 2) */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -5 }}
            className="md:col-span-2 relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                  <Code2 className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  Instant Code Generation
                </h3>
                <p className="text-muted-foreground mb-6">
                  Turn any request into code in your favorite language. Support
                  for JavaScript, Python, Go, Swift, and 20+ more.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["cURL", "Node.js", "Python", "Go", "PHP", "Java"].map(
                    (lang, idx) => (
                      <motion.span
                        key={lang}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{
                          delay: 0.5 + idx * 0.05,
                        }}
                        className="px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                      >
                        {lang}
                      </motion.span>
                    ),
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/2 rounded-xl bg-gray-950 border border-gray-800 p-4 shadow-xl">
                <div className="flex gap-1.5 mb-3 border-b border-gray-800 pb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />
                </div>
                <div className="font-mono text-xs space-y-1">
                  <div className="text-pink-400">
                    import <span className="text-white">requests</span>
                  </div>
                  <div className="text-gray-400 py-1" />
                  <div className="text-blue-300">response = requests.get(</div>
                  <div className="text-green-400 pl-4">
                    &apos;https://api.studio/v1/data&apos;
                  </div>
                  <div className="text-blue-300">)</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Grid of Smaller Features */}
          {[
            {
              title: "Real-time",
              desc: "WebSocket & SSE support",
              icon: Clock,
              color: "text-red-500",
              bg: "bg-red-500/10",
            },
            {
              title: "Organization",
              desc: "Collections & Folders",
              icon: FolderOpen,
              color: "text-orange-500",
              bg: "bg-orange-500/10",
            },
            {
              title: "Cookies",
              desc: "Advanced visuals",
              icon: Cookie,
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
          ].map((item, _i) => (
            <motion.div
              key={item.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.05 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-card/50 p-6 flex flex-col items-center text-center hover:bg-muted/50 transition-all duration-300"
            >
              <div
                className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
