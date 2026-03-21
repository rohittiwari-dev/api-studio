"use client";

import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  sections: { id: string; label: string; icon: any }[];
  activeSection: string;
  scrollToSection: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}

export function TableOfContents({
  sections,
  activeSection,
  scrollToSection,
}: TableOfContentsProps) {
  return (
    <nav className="sticky top-32">
      <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-[0.15em] mb-4">
        On this page
      </p>
      <div className="relative border-l border-white/5 ml-2 space-y-0.5">
        {sections.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => scrollToSection(e, item.id)}
              className={cn(
                "group flex items-center gap-3 py-1.5 pl-4 text-[13px] transition-all duration-300 relative",
                isActive
                  ? "text-teal-400 font-semibold"
                  : "text-muted-foreground/50 hover:text-foreground",
              )}
            >
              {isActive && (
                <span className="absolute -left-px top-0 bottom-0 w-px bg-linear-to-b from-teal-400 to-blue-400 rounded-full" />
              )}
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
