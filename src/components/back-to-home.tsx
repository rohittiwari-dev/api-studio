"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePWA } from "@/components/sw-register";

export function BackToHomeButton() {
  const { isPWA } = usePWA();

  // Hide in PWA mode since home is excluded
  if (isPWA) {
    return null;
  }

  return (
    <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
      <Link
        href="/"
        className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>
    </div>
  );
}
