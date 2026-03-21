"use client";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Container,
  Cpu,
  Database,
  Menu,
  Network,
  Server,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import { useTableOfContents } from "@/hooks/useTableOfContents";
import { cn } from "@/lib/utils";
import { CodeBlock } from "../../components/docs/CodeBlock";
import { DocsSidebar } from "../../components/docs/DocsSidebar";
import { TableOfContents } from "../../components/docs/TableOfContents";

const sections = [
  { id: "prerequisites", label: "Prerequisites", icon: Settings },
  { id: "configuration", label: "Configuration", icon: Database },
  { id: "deployment", label: "Deployment", icon: Container },
  { id: "troubleshooting", label: "Troubleshooting", icon: AlertCircle },
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"docker" | "manual">("docker");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sectionIds = sections.map((s) => s.id);
  const { activeSection, scrollToSection } = useTableOfContents(sectionIds);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-teal-500/30 font-sans overflow-x-hidden">
      <Header />

      {/* Mobile Nav */}
      <div className="lg:hidden sticky top-[72px] z-40 bg-background/80 backdrop-blur-2xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-4 h-4" />
          <span>Documentation</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <main className="flex-1 pt-24 mt-10 pb-24 relative">
        {/* Background Decor — matches landing page radial gradients */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(20,184,166,0.06)_0%,transparent_60%)] -translate-y-1/3" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.05)_0%,transparent_60%)] translate-y-1/3" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_80%,transparent_100%)]" />
        </div>

        <div className="container flex mx-auto items-start gap-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] relative z-10">
          {/* LEFT SIDEBAR */}
          <div className="hidden lg:block w-[240px] sticky max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <DocsSidebar
              sections={sections}
              activeSection={activeSection}
              scrollToSection={scrollToSection}
            />
          </div>
          <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
            {/* Mobile Drawer */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                  />
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="fixed top-0 left-0 bottom-0 w-[280px] bg-background border-r border-white/5 z-50 p-6 lg:hidden shadow-2xl flex flex-col"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-linear-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20">
                          <BookOpen className="w-4 h-4 text-teal-400" />
                        </div>
                        <span className="font-bold tracking-tight">Docs</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 bg-white/5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <DocsSidebar
                      sections={sections}
                      activeSection={activeSection}
                      scrollToSection={(e, id) => {
                        scrollToSection(e, id);
                        setIsMobileMenuOpen(false);
                      }}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* MAIN CONTENT */}
            <div className="flex-1 min-w-0 max-w-4xl pt-8 lg:pt-0">
              {/* Hero Header */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-20"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 mb-8 backdrop-blur-sm -ml-1">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium bg-linear-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent ml-1">
                    Self-Hosting Guide
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight leading-[1.05]">
                  Your Data.{" "}
                  <span className="relative inline-block mt-1">
                    <span className="absolute -inset-2 bg-linear-to-r from-teal-600/20 to-blue-600/20 blur-xl rounded-full opacity-50" />
                    <span className="relative bg-linear-to-r from-teal-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      Your Rules.
                    </span>
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-lg font-light">
                  Take full ownership of your API testing environment. Deploy
                  Api Studio on your own infrastructure with zero hidden
                  telemetry and zero vendor lock-in.
                </p>
              </motion.div>

              {/* Gradient Divider */}
              <div className="h-px bg-linear-to-r from-transparent via-teal-500/20 to-transparent mb-20" />

              <div className="space-y-32">
                {/* Prerequisites */}
                <section id="prerequisites" className="scroll-mt-32">
                  <SectionHeader
                    icon={Cpu}
                    title="Minimum Requirements"
                    tag="teal"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-linear-to-r from-teal-500/10 to-blue-500/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                      <div className="relative bg-card/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-white/2 border-b border-white/5">
                                <th className="text-left px-8 py-5 font-semibold uppercase tracking-wider text-[10px] text-muted-foreground/60">
                                  Components
                                </th>
                                <th className="text-center px-8 py-5 font-semibold uppercase tracking-wider text-[10px] text-teal-400">
                                  Docker Full
                                </th>
                                <th className="text-center px-8 py-5 font-semibold uppercase tracking-wider text-[10px] text-blue-400">
                                  Manual
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/4 font-medium">
                              {[
                                {
                                  label: "Docker Compose",
                                  docker: true,
                                  manual: false,
                                },
                                {
                                  label: "Node.js 20+",
                                  docker: "INCLUDED",
                                  manual: true,
                                },
                                {
                                  label: "PostgreSQL 16",
                                  docker: "INCLUDED",
                                  manual: true,
                                },
                                {
                                  label: "Redis 7+",
                                  docker: "INCLUDED",
                                  manual: true,
                                },
                              ].map((row) => (
                                <tr
                                  key={row.label}
                                  className="hover:bg-white/2 transition-colors"
                                >
                                  <td className="px-8 py-5 text-foreground/80">
                                    {row.label}
                                  </td>
                                  <td className="px-8 py-5 text-center">
                                    {row.docker === "INCLUDED" ? (
                                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                        INCLUDED
                                      </span>
                                    ) : row.docker ? (
                                      <Check className="w-5 h-5 text-teal-400 mx-auto" />
                                    ) : (
                                      <span className="text-muted-foreground/20">
                                        —
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-8 py-5 text-center">
                                    {row.manual ? (
                                      <Check className="w-5 h-5 text-blue-400 mx-auto" />
                                    ) : (
                                      <span className="text-muted-foreground/20">
                                        —
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </section>

                {/* Gradient Divider */}
                <div className="-mt-16 h-px bg-linear-to-r from-transparent via-blue-500/20 to-transparent" />

                {/* Configuration */}
                <section id="configuration" className="scroll-mt-32">
                  <SectionHeader
                    icon={Database}
                    title="Configuration"
                    tag="blue"
                  />
                  <p className="mb-8 text-muted-foreground/80 text-[15px] leading-relaxed font-light">
                    Define your core environment variables. Copy the example
                    below into a{" "}
                    <code className="mx-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-teal-300 font-mono text-sm shadow-inner">
                      .env
                    </code>{" "}
                    file in your project root.
                  </p>
                  <CodeBlock
                    filename=".env"
                    language="env"
                    code={`# DATABASE ACCESS
DATABASE_URL="postgresql://user:password@localhost:5432/apiclient"
POSTGRES_PASSWORD="secure-password-here"

# AUTHENTICATION
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_WEB_PUBLIC_URL="http://localhost:3000"

# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET="your-32nd-char-secret"

# CACHING (REQUIRED)
REDIS_URL="redis://localhost:6379"`}
                  />
                </section>

                {/* Gradient Divider */}
                <div className="-mt-16 h-px bg-linear-to-r from-transparent via-teal-500/20 to-transparent" />

                {/* Deployment */}
                <section id="deployment" className="scroll-mt-32">
                  <SectionHeader
                    icon={Container}
                    title="Deployment Methods"
                    tag="teal"
                  />

                  {/* Tab Row — matches SelfHosting.tsx tab pattern exactly */}
                  <div className="flex p-1 rounded-xl bg-white/2 border border-white/5 w-fit backdrop-blur-sm shadow-inner mb-10">
                    <button
                      type="button"
                      onClick={() => setActiveTab("docker")}
                      className={cn(
                        "relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2.5",
                        activeTab === "docker"
                          ? "text-white shadow-xl"
                          : "text-muted-foreground/60 hover:text-white",
                      )}
                    >
                      {activeTab === "docker" && (
                        <motion.div
                          layoutId="activeDocTab"
                          className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Server className="w-4 h-4" /> Docker
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("manual")}
                      className={cn(
                        "relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2.5",
                        activeTab === "manual"
                          ? "text-white shadow-xl"
                          : "text-muted-foreground/60 hover:text-white",
                      )}
                    >
                      {activeTab === "manual" && (
                        <motion.div
                          layoutId="activeDocTab"
                          className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Network className="w-4 h-4" /> Node.js
                      </span>
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-10"
                    >
                      {activeTab === "docker" ? (
                        <>
                          <div className="p-6 rounded-2xl bg-linear-to-r from-teal-500/5 to-blue-500/5 border border-teal-500/10 flex gap-5 items-start backdrop-blur-sm">
                            <div className="shrink-0 w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shadow-inner">
                              <Server className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground mb-1.5">
                                Battery-Included Bundle
                              </h4>
                              <p className="text-sm text-muted-foreground/80 leading-relaxed font-light">
                                Uses our docker-compose registry to instantly
                                spin up Postgres, Redis, and the Application —
                                all in a single command.
                              </p>
                            </div>
                          </div>
                          <StepBlock
                            number={1}
                            title="Run the Deployment Stack"
                          >
                            <CodeBlock
                              language="bash"
                              code={`docker-compose -f docker-compose.full.yml up -d`}
                            />
                          </StepBlock>
                        </>
                      ) : (
                        <>
                          <StepBlock
                            number={1}
                            title="Install Machine Dependencies"
                          >
                            <CodeBlock
                              language="bash"
                              code={`curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs git postgresql redis-server`}
                            />
                          </StepBlock>
                          <StepBlock number={2} title="Initialize the Database">
                            <CodeBlock
                              language="sql"
                              code={`CREATE DATABASE api_studio;
CREATE USER studio_user WITH ENCRYPTED PASSWORD 'your_pass';
GRANT ALL PRIVILEGES ON DATABASE api_studio TO studio_user;`}
                            />
                          </StepBlock>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </section>

                {/* Gradient Divider */}
                <div className="-mt-16 h-px bg-linear-to-r from-transparent via-blue-500/20 to-transparent" />

                {/* Troubleshooting */}
                <section id="troubleshooting" className="scroll-mt-32">
                  <SectionHeader
                    icon={AlertCircle}
                    title="Troubleshooting"
                    tag="amber"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        title: "Env Parsing Issues",
                        color: "rose",
                        glowColor: "rgba(244,63,94,0.15)",
                        desc: "Values with special characters must be wrapped in double quotes in your .env file.",
                      },
                      {
                        title: "DB Connection Denied",
                        color: "amber",
                        glowColor: "rgba(245,158,11,0.15)",
                        desc: "Ensure the PostgreSQL service is running and credentials match your configured DATABASE_URL exactly.",
                      },
                    ].map((item) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group relative"
                      >
                        <div
                          className="absolute -inset-0.5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"
                          style={{
                            background: `radial-gradient(circle, ${item.glowColor}, transparent)`,
                          }}
                        />
                        <div className="relative bg-card/60 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:border-white/20 transition-all duration-300">
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full mb-5",
                              `bg-${item.color}-500`,
                            )}
                          />
                          <h4 className="font-semibold text-foreground mb-2.5">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground/70 leading-relaxed font-light">
                            {item.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Gradient Divider */}
              <div className="mt-32 h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />

              {/* CTA Footer — matches landing page CTA tone */}
              <div className="mt-16 p-12 md:p-16 rounded-[2.5rem] relative overflow-hidden bg-linear-to-br from-teal-500/5 to-blue-500/5 border border-white/5 group">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(20,184,166,0.08)_0%,transparent_60%)] group-hover:opacity-150 transition-opacity duration-700" />
                <div className="relative z-10">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                    Still need help?
                  </h3>
                  <p className="text-muted-foreground/70 mb-10 max-w-xl text-lg leading-relaxed font-light">
                    Join our developer community on Discord or follow the
                    project updates on GitHub.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="/"
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-linear-to-r from-teal-500 to-blue-500 text-white font-semibold hover:opacity-90 transition-all shadow-[0_0_30px_-5px_rgba(20,184,166,0.4)] active:scale-95"
                    >
                      Join our Discord <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                      href="https://github.com/rohittiwari-dev/api-client"
                      target="_blank"
                      className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white/3 border border-white/10 text-foreground font-semibold hover:bg-white/6 hover:border-white/20 transition-all active:scale-95 backdrop-blur-sm"
                      rel="noopener"
                    >
                      Star on GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT TOC SIDEBAR */}
            <aside className="hidden xl:block w-[220px] shrink-0">
              <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <TableOfContents
                  sections={sections}
                  activeSection={activeSection}
                  scrollToSection={scrollToSection}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  tag,
}: {
  icon: any;
  title: string;
  tag: "teal" | "blue" | "amber";
}) {
  const colors = {
    teal: "bg-teal-500/10 border-teal-500/20 text-teal-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  };
  return (
    <div className="flex items-center gap-5 mb-12">
      <div
        className={cn(
          "shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl border shadow-inner",
          colors[tag],
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
    </div>
  );
}

function StepBlock({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative pl-14 pb-14 last:pb-0 group">
      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-card/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-xs font-bold text-teal-400 font-mono ring-[6px] ring-background z-10 transition-transform group-hover:scale-110 shadow-sm">
        {String(number).padStart(2, "0")}
      </div>
      <div className="absolute left-[19px] top-10 bottom-0 w-px bg-white/5 group-last:hidden group-hover:bg-teal-400/30 transition-colors duration-500" />
      <h3 className="text-[10px] font-semibold text-muted-foreground/50 mb-1.5 uppercase tracking-wider">
        {title}
      </h3>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}
