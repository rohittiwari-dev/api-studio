"use client";

import { ArrowRight, Github, Sparkles, Terminal } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useAuthStore } from "@/modules/authentication/store";

const MotionLink = motion.create(Link);

export default function CTA() {
  const { data } = useAuthStore();
  const isSignedIn = !!data?.session;

  return (
    <section className="py-32 lg:py-40 relative overflow-hidden bg-background">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl border border-white/[0.08] bg-card/30 backdrop-blur-sm p-10 md:p-16 overflow-hidden shadow-2xl shadow-primary/5">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-linear-to-br from-violet-500/[0.06] via-purple-500/[0.04] to-indigo-500/[0.06]" />

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,#000_30%,transparent_100%)]" />

            {/* Animated orbs */}
            <motion.div
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[80px] pointer-events-none"
            />
            <motion.div
              animate={{
                x: [0, -20, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"
            />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Free & Open Source
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight leading-[1.1]"
              >
                Ready to build{" "}
                <span className="bg-linear-to-r from-violet-600 via-purple-600 to-pink-600 dark:from-violet-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  something great?
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                Join developers worldwide using Api Studio to build, test, and
                ship APIs faster. Open source, free forever.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
              >
                <MotionLink
                  href={isSignedIn ? "/workspace" : "/sign-up"}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-primary/25"
                >
                  {isSignedIn ? (
                    <>
                      Open Workspace <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Start Building Free <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </MotionLink>

                <motion.a
                  href="https://github.com/rohittiwari-dev/api-client"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-card/60 border border-white/[0.08] text-foreground font-semibold text-base hover:bg-muted/50 transition-all flex items-center justify-center gap-2.5 backdrop-blur-sm"
                >
                  <Github className="w-4 h-4" />
                  Star on GitHub
                </motion.a>
              </motion.div>

              {/* Terminal snippet */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.5 }}
                whileHover={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-10 transition-opacity"
              >
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-background/40 border border-white/[0.06] font-mono text-xs text-muted-foreground backdrop-blur-sm">
                  <Terminal className="w-3.5 h-3.5 text-violet-500/60" />
                  <span>
                    git clone https://github.com/rohittiwari-dev/api-client.git
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
