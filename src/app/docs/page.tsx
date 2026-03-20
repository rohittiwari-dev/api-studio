"use client";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Container,
  Copy,
  Cpu,
  Database,
  Github,
  Globe,
  Server,
  Settings,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Footer from "@/components/home/Footer";
import Header from "@/components/home/Header";
import { cn } from "@/lib/utils";

const sections = [
  { id: "prerequisites", label: "Prerequisites", icon: Settings },
  { id: "configuration", label: "Configuration", icon: Database },
  { id: "deployment", label: "Deployment", icon: Container },
  { id: "troubleshooting", label: "Troubleshooting", icon: AlertCircle },
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"docker" | "manual">("docker");
  const [activeSection, setActiveSection] = useState("prerequisites");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Modern Scroll Spy using IntersectionObserver
  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find the first entry that is intersecting
      const visibleSection = entries.find((entry) => entry.isIntersecting);
      if (visibleSection) {
        setActiveSection(visibleSection.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-10% 0px -70% 0px", // Trigger when section is in top part of view
      threshold: 0,
    });

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Small delay to allow scroll to complete before updating state
      setTimeout(() => {
        setActiveSection(id);
      }, 100);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">
      <Header />

      {/* Mobile Nav Bar */}
      <div className="lg:hidden sticky top-[72px] z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <BookOpen className="w-4 h-4" />
          <span>Documentation</span>
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 transition-transform",
              isMobileMenuOpen && "rotate-90",
            )}
          />
        </button>
      </div>

      <main className="flex-1 pt-32 pb-24 relative">
        {/* Background Decor */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen opacity-20 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] mix-blend-screen opacity-20 -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          {/* Grid Layout: Sidebar + Content */}
          <div className="lg:grid lg:grid-cols-[256px_1fr] lg:gap-12">
            {/* STICKY SIDEBAR - Desktop Only */}
            <aside className="hidden lg:block">
              <nav className="sticky top-28 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-bold tracking-tight">
                      Documentation
                    </span>
                  </div>

                  <div className="space-y-1">
                    {sections.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => scrollToSection(e, item.id)}
                        className={cn(
                          "group flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-200 border border-transparent",
                          activeSection === item.id
                            ? "bg-secondary text-primary font-bold border-border shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-4 h-4 transition-colors",
                            activeSection === item.id
                              ? "text-primary"
                              : "text-muted-foreground/50 group-hover:text-muted-foreground",
                          )}
                        />
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-border space-y-4">
                  <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                    Resources
                  </p>
                  <div className="space-y-1">
                    <a
                      href="https://github.com/rohittiwari-dev/api-client"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub Repo</span>
                    </a>
                    <a
                      href="https://rohittiwari.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>rohittiwari.me</span>
                    </a>
                  </div>
                </div>
              </nav>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                  />
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    className="fixed top-[120px] left-4 right-4 bottom-4 bg-background border border-border rounded-2xl z-50 p-6 lg:hidden shadow-2xl"
                  >
                    <div className="space-y-6">
                      <p className="text-xs font-bold text-muted-foreground/30 uppercase tracking-widest">
                        On this page
                      </p>
                      <nav className="space-y-2">
                        {sections.map((item) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={(e) => scrollToSection(e, item.id)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl border transition-all",
                              activeSection === item.id
                                ? "bg-primary/5 border-primary/20 text-primary font-bold"
                                : "text-muted-foreground border-transparent",
                            )}
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </a>
                        ))}
                      </nav>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Content Area */}
            <div className="min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-16"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary mb-6 tracking-wide uppercase">
                  <Sparkles className="w-3 h-3" />
                  Documentation
                </div>
                <h1 className="text-5xl sm:text-6xl font-black mb-6 tracking-tight text-foreground">
                  Self-Hosting Guide
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  Take full ownership of your data and infrastructure. Deploy
                  Api Studio anywhere Docker or Node.js can run.
                </p>
              </motion.div>

              <div className="space-y-32">
                {/* Prerequisites */}
                <section id="prerequisites" className="scroll-mt-32">
                  <SectionHeader icon={Cpu} title="Minimum Requirements" />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div className="bg-secondary/30 border border-border rounded-4xl overflow-hidden shadow-sm relative">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50 border-b border-border">
                              <th className="text-left px-8 py-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
                                Components
                              </th>
                              <th className="text-center px-8 py-5 font-bold uppercase tracking-wider text-[11px] text-primary">
                                Docker Full
                              </th>
                              <th className="text-center px-8 py-5 font-bold uppercase tracking-wider text-[11px] text-indigo-500">
                                Manual
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border font-medium">
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
                            ].map((row, i) => (
                              <tr
                                key={i?.toString()}
                                className="hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-8 py-5 text-foreground/80">
                                  {row.label}
                                </td>
                                <td className="px-8 py-5 text-center">
                                  {row.docker === "INCLUDED" ? (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                      INCLUDED
                                    </span>
                                  ) : row.docker ? (
                                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                                  ) : (
                                    <span className="text-muted-foreground/30">
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="px-8 py-5 text-center">
                                  {row.manual ? (
                                    <Check className="w-5 h-5 text-indigo-500 mx-auto" />
                                  ) : (
                                    <span className="text-muted-foreground/30">
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
                  </motion.div>
                </section>

                {/* Configuration */}
                <section id="configuration" className="scroll-mt-32">
                  <SectionHeader icon={Database} title="Configuration" />
                  <p className="mb-6 text-muted-foreground">
                    Define your core settings. Copy the example below into a
                    <code className="mx-1 px-2 py-0.5 rounded bg-muted border border-border text-foreground font-mono text-xs">
                      .env
                    </code>
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

                {/* Deployment */}
                <section id="deployment" className="scroll-mt-32">
                  <SectionHeader icon={Container} title="Deployment Methods" />

                  <div className="flex p-1 bg-secondary border border-border rounded-xl mb-10 w-fit">
                    <button
                      type="button"
                      onClick={() => setActiveTab("docker")}
                      className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                        activeTab === "docker"
                          ? "text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {activeTab === "docker" && (
                        <motion.div
                          layoutId="activeDocTab"
                          className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Container className="w-4 h-4" />
                        Docker Full
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("manual")}
                      className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                        activeTab === "manual"
                          ? "text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {activeTab === "manual" && (
                        <motion.div
                          layoutId="activeDocTab"
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
                        Manual VPS
                      </span>
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      {activeTab === "docker" ? (
                        <>
                          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4">
                            <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Container className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-bold mb-1">
                                Battery-Included Bundle
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Uses docker-compose.full.yml to handle DB &
                                Redis automatically.
                              </p>
                            </div>
                          </div>
                          <StepBlock number={1} title="Run Deployment Service">
                            <CodeBlock
                              language="bash"
                              code={`docker-compose -f docker-compose.full.yml up -d`}
                            />
                          </StepBlock>
                        </>
                      ) : (
                        <>
                          <StepBlock number={1} title="Install Dependencies">
                            <CodeBlock
                              language="bash"
                              code={`curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs git postgresql redis-server`}
                            />
                          </StepBlock>
                          <StepBlock number={2} title="Setup Database">
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

                {/* Troubleshooting */}
                <section id="troubleshooting" className="scroll-mt-32">
                  <SectionHeader icon={AlertCircle} title="Troubleshooting" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "Env Parsing",
                        color: "rose",
                        desc: "Values with special characters must be wrapped in double quotes.",
                      },
                      {
                        title: "DB Read-Only",
                        color: "amber",
                        desc: "Ensure Postgres service is running and credentials match your .env.",
                      },
                    ].map((item, i) => (
                      <motion.div
                        key={i?.toString()}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{
                          opacity: 1,
                          y: 0,
                        }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-card border border-border p-6 rounded-2xl hover:border-primary/20 transition-all duration-300"
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full mb-4",
                            `bg-${item.color}-500`,
                          )}
                        />
                        <h4 className="font-bold mb-2">{item.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Support Footer */}
              <div className="mt-32 p-12 rounded-[2.5rem] bg-secondary/30 border border-border relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
                  <p className="text-muted-foreground mb-8 max-w-lg leading-relaxed">
                    Join our community on Discord or follow updates on GitHub.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all shadow-lg active:scale-95"
                    >
                      Join Discord <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                      href="https://github.com/rohittiwari-dev/api-client"
                      target="_blank"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-background border border-border text-foreground font-bold hover:bg-secondary transition-all active:scale-95"
                      rel="noopener"
                    >
                      Star on GitHub
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-3xl font-black tracking-tight text-foreground">
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
    <div className="relative pl-12 pb-12 last:pb-0 group">
      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-primary ring-2 ring-background z-10 transition-transform group-hover:scale-110">
        {number}
      </div>
      <div className="absolute left-4 top-8 bottom-0 w-px bg-border group-last:hidden" />
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}

function CodeBlock({
  code,
  filename,
  language: _language = "text",
}: {
  code: string;
  filename?: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCode = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.trim().startsWith("#") || line.trim().startsWith("--")) {
        return (
          <div key={i?.toString()} className="text-muted-foreground/50 italic">
            {line}
          </div>
        );
      }
      const parts = line.split("=");
      if (parts.length > 1) {
        return (
          <div key={i?.toString()} className="flex gap-1.5 flex-wrap">
            <span className="text-purple-400 font-bold">{parts[0]}</span>
            <span className="text-white/30">=</span>
            <span className="text-green-400">{parts.slice(1).join("=")}</span>
          </div>
        );
      }
      return (
        <div key={i?.toString()} className="text-slate-300">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="group relative rounded-3xl overflow-hidden bg-[#0d0e12] border border-white/10 shadow-xl mt-4">
      {filename && (
        <div className="px-6 py-3 border-b border-white/5 bg-white/2 flex items-center justify-between">
          <div className="flex gap-1.5 mr-4">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
            <div className="w-2 h-2 rounded-full bg-slate-800" />
            <div className="w-2 h-2 rounded-full bg-slate-800" />
          </div>
          <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.2em]">
            {filename}
          </span>
        </div>
      )}
      <div className="relative p-6 font-mono text-[13px] leading-relaxed overflow-x-auto">
        {highlightCode(code)}
        <button
          type="button"
          onClick={copyToClipboard}
          className="absolute right-4 top-4 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all backdrop-blur-md border border-white/5"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
