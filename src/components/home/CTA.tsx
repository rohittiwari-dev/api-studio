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
    <section className="py-24 lg:py-32 relative overflow-hidden bg-background">
      {/* Clean background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/4 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-4xl border border-border bg-card/40 backdrop-blur-md px-6 py-16 md:p-20 overflow-hidden shadow-xl shadow-primary/5">
            {/* Subtle glowing corners inside the card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px]" />

            <div className="relative z-20 flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  100% Free & Open Source
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-foreground tracking-tight"
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
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
              >
                Join developers escaping slow Electron apps. Fast, local,
                powerful—the way an API client should be.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
              >
                <MotionLink
                  href={isSignedIn ? "/workspace" : "/sign-up"}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group w-full sm:w-auto h-14 bg-primary text-primary-foreground font-semibold px-8 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/25 transition-all hover:brightness-110"
                >
                  {isSignedIn ? "Open Workspace" : "Start Building Free"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </MotionLink>

                <motion.a
                  href="https://github.com/rohittiwari-dev/api-client"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto h-14 px-8 rounded-xl bg-background/50 border border-border text-foreground font-semibold flex items-center justify-center gap-3 hover:bg-muted/50 transition-all shadow-sm"
                >
                  <Github className="w-4 h-4" />
                  View on GitHub
                </motion.a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="mt-14"
              >
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-background border border-border font-mono text-sm text-foreground/80 shadow-sm">
                  <Terminal className="w-4 h-4 text-violet-500" />
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
