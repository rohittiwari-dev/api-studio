"use client";

import { ArrowRight, Github, Heart, Sparkles, Terminal } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useAuthStore } from "@/modules/authentication/store";

const MotionLink = motion.create(Link);

export default function CTA() {
  const { data } = useAuthStore();
  const isSignedIn = !!data?.session;

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl bg-secondary/30 border border-border p-8 md:p-12 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 group">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-violet-500/5 via-purple-500/5 to-indigo-500/5 opacity-50" />

            {/* Animated Mesh */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8"
              >
                <Heart className="w-3.5 h-3.5 text-primary fill-primary animate-pulse" />
                <span className="text-xs font-medium text-primary">
                  Built for developers
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold mb-6 text-foreground tracking-tight"
              >
                Ready to transform your <br className="hidden md:block" />
                <span className="bg-linear-to-r from-violet-600 via-purple-600 to-pink-600 dark:from-violet-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  API development?
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                Join thousands of developers using Api Studio to build, test,
                and document APIs faster. Open source, free forever for
                individuals.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
              >
                <MotionLink
                  href={isSignedIn ? "/workspace" : "/sign-up"}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-base hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isSignedIn ? (
                    <>
                      Open Workspace <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Start Building Free <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </MotionLink>

                <motion.a
                  href="https://github.com/rohittiwari-dev/api-client"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-card border border-border text-foreground font-medium text-base hover:bg-secondary/50 transition-all flex items-center justify-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  Star on GitHub
                </motion.a>
              </motion.div>

              {/* Terminal aesthetic decoration */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.6 }}
                whileHover={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-10 transition-opacity"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/50 border border-border font-mono text-xs text-muted-foreground">
                  <Terminal className="w-3 h-3" />
                  <span>npm install -g api-client-cli</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
