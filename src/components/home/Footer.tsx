"use client";

import {
  IconBrandGithubFilled,
  IconBrandTwitterFilled,
} from "@tabler/icons-react";
import { ExternalLink, Heart, Mail } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "Documentation", href: "/docs" },
    { label: "Self-Hosting", href: "/docs#self-hosting" },
  ],
  community: [
    {
      label: "GitHub",
      href: "https://github.com/rohittiwari-dev/api-client",
      external: true,
    },
    {
      label: "Discussions",
      href: "https://github.com/rohittiwari-dev/api-client/discussions",
      external: true,
    },
    {
      label: "Contributing",
      href: "https://github.com/rohittiwari-dev/api-client/blob/main/CONTRIBUTING.md",
      external: true,
    },
  ],
  legal: [
    {
      label: "AGPL-3.0 License",
      href: "https://github.com/rohittiwari-dev/api-client/blob/main/LICENSE",
      external: true,
    },
    {
      label: "Security",
      href: "https://github.com/rohittiwari-dev/api-client/blob/main/SECURITY.md",
      external: true,
    },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-muted/20">
      {/* Gradient border effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <motion.div
                className="relative w-10 h-10"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src="/logo.png"
                  alt="Api Studio Logo"
                  fill
                  className="object-contain"
                />
              </motion.div>
              <span className="text-xl font-bold bg-linear-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Api Studio
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              A beautiful, powerful API testing tool built with love for
              developers everywhere.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              <motion.a
                href="https://github.com/rohittiwari-dev/api-client"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-500 transition-colors"
                aria-label="GitHub"
              >
                <IconBrandGithubFilled className="w-5 h-5 text-muted-foreground" />
              </motion.a>
              <motion.a
                href="https://twitter.com/rohittiwaridev"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-500 transition-colors"
                aria-label="Twitter"
              >
                <IconBrandTwitterFilled className="w-5 h-5 text-muted-foreground" />
              </motion.a>
              <motion.a
                href="mailto:hello@apistudio.dev"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-500 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-muted-foreground" />
              </motion.a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Community
            </h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Api Studio. AGPL-3.0 License.
          </p>
          <motion.p
            className="text-sm text-muted-foreground flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            Made with{" "}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            </motion.span>{" "}
            by{" "}
            <a
              href="https://github.com/rohittiwari-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 transition-colors font-medium"
            >
              Rohit Tiwari
            </a>
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
