"use client";

import { IconBrandGithub } from "@tabler/icons-react";
import { ArrowRight, Code2, Globe, Layers, Shield, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { APP_VERSION } from "@/constants";
import { useAuthStore } from "@/modules/authentication/store";

const MotionLink = motion.create(Link);

// Hero abstract floating graphics
function HeroGraphics() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative w-full aspect-square md:aspect-4/3 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden group perspective-[1000px]">
      {/* Ambient central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-violet-500/30 rounded-full blur-[100px] group-hover:bg-violet-500/40 transition-colors duration-1000" />
      <div className="absolute top-[40%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-[80px]" />

      {/* Grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_100%_100%_at_50%_50%,#000_30%,transparent_100%)]" />

      {/* Center Core */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-3xl bg-white/5 border border-white/20 backdrop-blur-2xl flex items-center justify-center z-20 shadow-[0_0_60px_-10px_rgba(139,92,246,0.4)]"
        animate={{
          boxShadow: [
            "0 0 60px -10px rgba(139,92,246,0.4)",
            "0 0 100px -5px rgba(139,92,246,0.6)",
            "0 0 60px -10px rgba(139,92,246,0.4)",
          ],
        }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
        style={{ transform: "translateZ(50px)" }}
      >
        <Layers className="w-12 h-12 text-violet-300" />
        {/* Inner rotating rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute inset-[-15px] rounded-[40px] border border-violet-500/30 border-t-violet-400 border-b-violet-400"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute inset-[-30px] rounded-[50px] border border-blue-500/20 border-l-blue-400 border-r-blue-400"
        />
        <motion.div
          animate={{ rotate: 180 }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute inset-[-45px] rounded-full border border-fuchsia-500/10 border-t-fuchsia-400/50"
        />
      </motion.div>

      {/* Floating UI cards */}
      <motion.div
        animate={{ y: [-15, 15, -15], rotateZ: [-2, 2, -2] }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="absolute top-12 left-12 lg:top-20 lg:left-16 rounded-xl bg-black/60 border border-white/10 backdrop-blur-xl p-4 shadow-2xl z-30 w-48"
        style={{ transform: "translateZ(80px)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
            <span className="text-sm font-bold text-green-400">GET</span>
          </div>
          <div className="flex-1 font-mono text-[10px] text-white/60 truncate">
            /api/v1/users
          </div>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="h-full bg-green-400"
          />
        </div>
        <div className="flex justify-between mt-2 font-mono text-[8px] text-white/40">
          <span>Status: 200 OM</span>
          <span>42ms</span>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [15, -15, 15], rotateZ: [2, -2, 2] }}
        transition={{
          duration: 9,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-12 right-12 lg:bottom-20 lg:right-16 rounded-xl bg-black/60 border border-white/10 backdrop-blur-xl p-4 shadow-2xl z-30 w-52"
        style={{ transform: "translateZ(60px)" }}
      >
        <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white/90">WebSocket</div>
            <div className="text-[9px] text-green-400">Connected • wss://</div>
          </div>
        </div>
        <div className="space-y-1.5 font-mono text-[9px]">
          <div className="text-white/40">
            <span className="text-blue-400">↓</span> {"{ event: 'sync' }"}
          </div>
          <div className="text-white/40">
            <span className="text-green-400">↑</span> {"{ status: 'ok' }"}
          </div>
          <div className="text-white/40">
            <span className="text-blue-400">↓</span> {"{ event: 'data' }"}
          </div>
        </div>
      </motion.div>

      {/* Floating Orbs & Particles */}
      {mounted &&
        [...Array(20)].map((_, i) => (
          <motion.div
            key={i?.toString()}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50 - Math.random() * 50],
              opacity: [0, 1, 0],
              scale: [0, Math.random() * 2 + 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 5,
            }}
          />
        ))}
    </div>
  );
}

export default function Hero() {
  const { data } = useAuthStore();
  const isSignedIn = !!data?.session;
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32 bg-background">
      {/* Abstract Background Beams & Gradients */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_60%)] -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(59,130,246,0.06)_0%,transparent_60%)] translate-y-1/2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_80%,transparent_100%)]" />

        {/* Diagonal laser beam */}
        <motion.div
          animate={{ x: ["-100%", "200%"], opacity: [0, 1, 0] }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            repeatDelay: 2,
          }}
          className="absolute top-1/4 left-0 w-[500px] h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent rotate-15 blur-[1px]"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Content */}
          <motion.div
            className="text-center lg:text-left order-2 lg:order-1"
            style={{ y: y1, opacity }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/3 border border-white/10 backdrop-blur-md mb-8 shadow-[0_0_20px_-5px_rgba(139,92,246,0.2)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs font-medium text-foreground/80 tracking-wide">
                Api Studio Platform — v{APP_VERSION}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-[80px] font-bold tracking-tight mb-8 leading-[1.05]"
            >
              Master your <br />
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-2 bg-linear-to-r from-violet-600/30 via-blue-600/30 to-fuchsia-600/30 blur-2xl rounded-full opacity-50" />
                <span className="relative bg-linear-to-r from-violet-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                  API Workflow
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-muted-foreground/80 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
            >
              The professional, ultra-fast API client for developers who care
              about speed and aesthetics. Debug, test, and trace your endpoints
              without the bloat.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-14"
            >
              <MotionLink
                href={isSignedIn ? "/workspace" : "/sign-up"}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="h-14 px-8 rounded-xl bg-primary text-primary-foreground font-semibold text-base shadow-[0_0_30px_-5px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_-5px_rgba(139,92,246,0.6)] border border-primary/50 transition-all flex items-center justify-center gap-3"
              >
                {isSignedIn ? "Open Workspace" : "Start Building Free"}
                <ArrowRight className="w-4 h-4" />
              </MotionLink>

              <motion.a
                href="https://github.com/rohittiwari-dev/api-client"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="h-14 px-8 rounded-xl bg-white/3 border border-white/10 hover:bg-white/6 hover:border-white/20 font-medium text-base backdrop-blur-sm transition-all flex items-center justify-center gap-3"
              >
                <IconBrandGithub className="w-5 h-5" />
                <span>Star on GitHub</span>
              </motion.a>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5"
            >
              {[
                {
                  icon: Zap,
                  title: "Ultra Fast",
                  desc: "Native-like performance",
                  color: "text-amber-400",
                },
                {
                  icon: Shield,
                  title: "Local First",
                  desc: "Your data stays yours",
                  color: "text-emerald-400",
                },
                {
                  icon: Code2,
                  title: "Open Source",
                  desc: "100% transparent",
                  color: "text-blue-400",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-2 text-foreground/90 font-medium text-sm">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 tracking-wide font-light">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Abstract 3D Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="order-1 lg:order-2 perspective-[2000px] relative z-20"
          >
            <motion.div
              whileHover={{ rotateY: 5, rotateX: -5 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="relative w-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              <HeroGraphics />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
