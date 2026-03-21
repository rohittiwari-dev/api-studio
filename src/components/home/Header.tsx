"use client";

import { IconBrandGithub } from "@tabler/icons-react";
import { ArrowRight, ChevronRight, Menu, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/modules/authentication/store";

const MotionLink = motion.create(Link);

export default function Header() {
  const { data } = useAuthStore();
  const isSignedIn = !!data?.session;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > 100 && latest > previous) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setIsScrolled(latest > 20);
  });

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "Community", href: "/#community" },
    { label: "Docs", href: "/docs" },
  ];

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out flex items-center ${
        isScrolled
          ? "h-16 glass-card shadow-sm"
          : "h-20 bg-transparent border-b-transparent"
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-primary/10 border border-primary/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image
                src="/logo.png"
                alt="Api Studio Logo"
                fill
                className="object-contain p-1"
              />
            </motion.div>
            <span className="text-lg font-bold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Api Studio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  } group`}
                >
                  {link.label}
                  <span className="absolute inset-0 rounded-full bg-secondary/50 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 -z-10" />
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.a
                href="https://github.com/rohittiwari-dev/api-client"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
                aria-label="GitHub"
              >
                <IconBrandGithub className="w-4 h-4" />
              </motion.a>
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            {isSignedIn ? (
              <MotionLink
                href="/workspace"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pl-4 pr-3 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-[0_4px_14px_0_rgba(139,92,246,0.2)] flex items-center gap-1.5 hover:shadow-[0_6px_20px_0_rgba(139,92,246,0.3)] transition-all"
              >
                Launch App
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <ChevronRight className="w-3 h-3 text-white" />
                </div>
              </MotionLink>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <MotionLink
                  href="/sign-up"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-full bg-foreground text-background font-semibold text-sm hover:opacity-90 shadow-sm transition-all"
                >
                  Start Free
                </MotionLink>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-border bg-card hover:bg-muted transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-foreground" />
              ) : (
                <Menu className="w-4 h-4 text-foreground" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-4 right-4 p-4 rounded-3xl bg-card/95 backdrop-blur-2xl border border-border shadow-2xl md:hidden overflow-hidden"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-3.5 text-[15px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="h-px bg-border/50 my-3 mx-2" />

              <a
                href="https://github.com/rohittiwari-dev/api-client"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 text-[15px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <IconBrandGithub className="w-5 h-5" />
                  Star on GitHub
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </a>
            </nav>

            <div className="mt-4 flex flex-col gap-3">
              {isSignedIn ? (
                <Link
                  href="/workspace"
                  className="w-full px-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-center flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Launch Workspace <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/sign-in"
                    className="w-full px-4 py-3.5 rounded-xl bg-secondary text-secondary-foreground font-medium text-center border border-border"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="w-full px-4 py-3.5 rounded-xl bg-foreground text-background font-semibold text-center shadow-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Start Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
