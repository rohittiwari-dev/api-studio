"use client";

import {
  Bot,
  BrainCircuit,
  FileSearch,
  Loader2,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const DEMO_CONVERSATION = [
  {
    role: "user" as const,
    content: "My API is returning 403 but my token seems correct. Why?",
  },
  {
    role: "assistant" as const,
    content:
      "A 403 (Forbidden) means you're **authenticated** but not **authorized**. Common causes:\n\n- Your token lacks the required **scope** or **permission**\n- The resource requires a different role (e.g. `admin`)\n- Check the `WWW-Authenticate` header for hints\n\nTry inspecting the token payload at **jwt.io** to verify included scopes.",
  },
];

const CAPABILITIES = [
  {
    icon: BrainCircuit,
    title: "Debug Responses",
    desc: "Explain status codes, headers, and error messages instantly",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: FileSearch,
    title: "Analyze Requests",
    desc: "Review your request structure and suggest improvements",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Zap,
    title: "Quick Answers",
    desc: "Auth flows, headers, body formats — ask in plain English",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

const QUICK_PROMPTS = [
  "How do I add Bearer auth?",
  "What does a 401 response mean?",
  "How to send JSON in body?",
];

function TypingDot({ delay }: { delay: number }) {
  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay }}
      className="w-1.5 h-1.5 rounded-full bg-violet-400"
    />
  );
}

export default function AiShowcase() {
  const [phase, setPhase] = useState<"idle" | "typing" | "done">("idle");
  const [displayedText, setDisplayedText] = useState("");
  const [activePrompt, setActivePrompt] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Kick off the demo loop
    const startDemo = () => {
      setPhase("typing");
      setDisplayedText("");
      const target = DEMO_CONVERSATION[1].content;
      let i = 0;
      const tick = () => {
        i++;
        setDisplayedText(target.slice(0, i));
        if (i < target.length) {
          timerRef.current = setTimeout(tick, 12);
        } else {
          setPhase("done");
          // Restart after pause
          timerRef.current = setTimeout(() => {
            setDisplayedText("");
            setPhase("idle");
            timerRef.current = setTimeout(startDemo, 1200);
          }, 5000);
        }
      };
      timerRef.current = setTimeout(tick, 900);
    };

    timerRef.current = setTimeout(startDemo, 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Cycle quick prompts
  useEffect(() => {
    const id = setInterval(
      () => setActivePrompt((p) => (p + 1) % QUICK_PROMPTS.length),
      2800,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-32 lg:py-40 relative overflow-hidden bg-background">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-500/[0.04] rounded-full blur-[140px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center max-w-7xl mx-auto">
          {/* Left — Animated Chat Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <div className="relative rounded-2xl border border-white/[0.08] bg-card/40 shadow-2xl shadow-black/20 overflow-hidden backdrop-blur-sm">
              {/* Window bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-muted/20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-violet-400" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground/70">
                    Ask AI
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                  </span>
                  <span className="text-[10px] font-medium text-violet-400/80">
                    Gemini
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[280px]">
                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-end"
                >
                  <div className="max-w-[80%] px-4 py-2.5 rounded-xl rounded-tr-sm bg-primary text-primary-foreground text-[12px] leading-relaxed">
                    {DEMO_CONVERSATION[0].content}
                  </div>
                </motion.div>

                {/* AI response */}
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <AnimatePresence mode="wait">
                      {phase === "idle" ? (
                        <motion.div
                          key="typing-indicator"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-1 px-4 py-3 rounded-xl rounded-tl-sm bg-muted/40 border border-border/30 w-fit"
                        >
                          <TypingDot delay={0} />
                          <TypingDot delay={0.15} />
                          <TypingDot delay={0.3} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="response"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="px-4 py-3 rounded-xl rounded-tl-sm bg-muted/40 border border-border/30 text-[12px] leading-relaxed text-foreground/90"
                        >
                          {/* Render simple markdown-like bold */}
                          {displayedText
                            .split(/(\*\*[^*]+\*\*)/)
                            .map((part, i) => {
                              if (
                                part.startsWith("**") &&
                                part.endsWith("**")
                              ) {
                                return (
                                  <strong key={i?.toString()}>
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return <span key={i?.toString()}>{part}</span>;
                            })}
                          {phase === "typing" && (
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Number.POSITIVE_INFINITY,
                              }}
                              className="inline-block w-1 h-3.5 bg-violet-400 ml-0.5 align-middle"
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="px-5 py-4 border-t border-white/[0.06] bg-muted/10">
                <div className="flex gap-2 items-center">
                  <div className="flex-1 rounded-lg bg-background/60 border border-white/[0.08] px-3 py-2 text-[11px] text-muted-foreground/50 font-mono overflow-hidden whitespace-nowrap">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={activePrompt}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3 }}
                      >
                        {QUICK_PROMPTS[activePrompt]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-violet-600/80 flex items-center justify-center shrink-0">
                    {phase === "typing" ? (
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Copy */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-500">
                Powered by Gemini
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight leading-[1.1]">
              Your AI{" "}
              <span className="bg-linear-to-r from-violet-600 via-purple-600 to-pink-600 dark:from-violet-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                API copilot
              </span>
            </h2>

            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
              Ask questions in plain English. Get instant explanations for
              status codes, auth flows, and request structure — right inside
              your workflow.
            </p>

            <div className="space-y-4">
              {CAPABILITIES.map((cap, i) => (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  className="group flex gap-4 p-4 rounded-xl hover:bg-muted/30 transition-colors -mx-4"
                >
                  <div
                    className={`shrink-0 w-11 h-11 rounded-xl ${cap.bg} ${cap.border} border flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <cap.icon className={`w-5 h-5 ${cap.color}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {cap.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
