"use client";

import { Check, Copy, Laptop, Server, Terminal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const installationMethods = {
  docker: [
    {
      num: "01",
      title: "Clone Repository",
      cmd: "git clone https://github.com/rohittiwari-dev/api-client.git",
    },
    {
      num: "02",
      title: "Enter Directory",
      cmd: "cd api-client",
    },
    {
      num: "03",
      title: "Start Services",
      cmd: "docker compose up -d",
    },
  ],
  manual: [
    {
      num: "01",
      title: "Clone Repository",
      cmd: "git clone https://github.com/rohittiwari-dev/api-client.git",
    },
    {
      num: "02",
      title: "Install Dependencies",
      cmd: "npm install",
    },
    {
      num: "03",
      title: "Start Development Server",
      cmd: "npm run dev",
    },
  ],
};

export default function SelfHosting() {
  const [activeTab, setActiveTab] = useState<"docker" | "manual">("docker");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="relative rounded-3xl bg-secondary/30 border border-border p-8 md:p-12 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-violet-500/5 via-purple-500/5 to-indigo-500/5 opacity-50" />

            {/* Animated Mesh */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start">
              {/* Left Content */}
              <div className="flex-1 lg:max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Terminal className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    Deployment
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  Your Data.={" "}
                  <span className="bg-linear-to-r from-violet-600 to-pink-600 dark:from-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
                    Your Infrastructure.
                  </span>
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Keep full control of your API testing environment. Deploy Api
                  Studio on your own servers with just a few commands. No hidden
                  telemetry, no vendor lock-in.
                </p>

                <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Open Source
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    {activeTab === "docker" ? "Docker Ready" : "Node.js Ready"}
                  </span>
                </div>
              </div>

              {/* Right Steps */}
              <div className="flex-1 w-full space-y-6">
                {/* Tabs */}
                <div className="flex p-1 rounded-xl bg-muted/50 border border-border w-fit">
                  <button
                    type="button"
                    onClick={() => setActiveTab("docker")}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      activeTab === "docker"
                        ? "text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {activeTab === "docker" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      Docker
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("manual")}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      activeTab === "manual"
                        ? "text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {activeTab === "manual" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Laptop className="w-4 h-4" />
                      Manual
                    </span>
                  </button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {installationMethods[activeTab].map((step, index) => (
                        <motion.div
                          key={step.num}
                          initial={{
                            opacity: 0,
                            x: 20,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay: index * 0.1,
                          }}
                          className="relative group"
                        >
                          <div
                            className={`absolute -inset-0.5 bg-linear-to-r ${
                              index === 2
                                ? "from-green-500 to-emerald-500"
                                : "from-violet-500 to-purple-500"
                            } rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500`}
                          />
                          <div className="relative flex items-center gap-4 p-4 rounded-xl bg-card border border-border group-hover:border-primary/20 transition-colors">
                            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-base font-bold text-muted-foreground font-mono">
                              {step.num}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                {step.title}
                              </div>
                              <code className="block text-sm font-mono text-foreground truncate">
                                <span className="text-violet-500 mr-2">$</span>
                                {step.cmd}
                              </code>
                            </div>

                            <button
                              type="button"
                              onClick={() => copyCommand(step.cmd, index)}
                              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground shrink-0"
                              title="Copy command"
                            >
                              {copiedIndex === index ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                          {/* Connecting Line */}
                          {index !==
                            installationMethods[activeTab].length - 1 && (
                            <div className="absolute left-9 bottom-0 translate-y-full w-px h-4 bg-border/50 -z-10" />
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
