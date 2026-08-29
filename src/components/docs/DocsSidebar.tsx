"use client";

import { IconBrandGithub } from "@tabler/icons-react";
import { BookOpen, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocsSidebarProps {
  sections: { id: string; label: string; icon: any }[];
  activeSection: string;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

export function DocsSidebar({
  sections,
  activeSection,
  scrollToSection,
}: DocsSidebarProps) {
  return (
    <nav className="sticky top-32 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-linear-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 shadow-inner backdrop-blur-sm">
            <BookOpen className="w-4 h-4 text-teal-400" />
          </div>
          <span className="font-bold tracking-tight text-foreground">
            Api Studio
          </span>
        </div>

        <div className="space-y-1">
          {sections.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollToSection(e, item.id)}
              className={cn(
                "group flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl transition-all duration-300 border",
                activeSection === item.id
                  ? "bg-linear-to-r from-teal-500/10 to-blue-500/10 text-teal-400 font-semibold border-teal-500/20 shadow-sm"
                  : "border-transparent text-muted-foreground/70 hover:text-foreground hover:bg-white/3",
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 transition-colors duration-300",
                  activeSection === item.id
                    ? "text-teal-400"
                    : "text-muted-foreground/40 group-hover:text-muted-foreground",
                )}
              />
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 space-y-4">
        <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-[0.2em] px-2">
          Resources
        </p>
        <div className="space-y-1">
          <a
            href="https://github.com/rohittiwari-dev/api-client"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground/60 hover:text-foreground hover:bg-white/3 transition-all group"
          >
            <IconBrandGithub className="w-4 h-4 group-hover:text-teal-400 transition-colors" />
            <span className="font-medium">GitHub Repository</span>
          </a>
          <a
            href="https://rohittiwari.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground/60 hover:text-foreground hover:bg-white/3 transition-all group"
          >
            <Globe className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
            <span className="font-medium">Creator Website</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
