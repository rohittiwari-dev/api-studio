"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  filename?: string;
  language?: string;
}

export function CodeBlock({
  code,
  filename,
  language = "text",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCode = (text: string) => {
    return text.split("\n").map((line, i) => {
      // Basic Comments
      if (line.trim().startsWith("#") || line.trim().startsWith("--")) {
        return (
          <div key={i?.toString()} className="text-[#a1a1aa] italic">
            {line}
          </div>
        );
      }
      // Simple Key-Value
      const parts = line.split("=");
      if (parts.length > 1 && language === "env") {
        return (
          <div key={i?.toString()} className="flex gap-1.5 flex-wrap">
            <span className="text-[#cba6f7] font-bold">{parts[0]}</span>
            <span className="text-[#89b4fa]">=</span>
            <span className="text-[#a6e3a1]">{parts.slice(1).join("=")}</span>
          </div>
        );
      }
      // SQL Keywords
      if (language === "sql") {
        const keywords = [
          "CREATE",
          "DATABASE",
          "USER",
          "WITH",
          "ENCRYPTED",
          "PASSWORD",
          "GRANT",
          "ALL",
          "PRIVILEGES",
          "ON",
          "TO",
        ];
        let highlighted = line;
        keywords.forEach((kw) => {
          const regex = new RegExp(`\\b${kw}\\b`, "g");
          highlighted = highlighted.replace(
            regex,
            `<span class="text-[#cba6f7] font-bold">\${kw}</span>`,
          );
        });
        return (
          <div
            key={i?.toString()}
            className="text-[#cdd6f4]"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: required
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        );
      }
      // General Strings
      return (
        <div key={i?.toString()} className="text-[#cdd6f4]">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-[#18181b] border border-[#27272a] shadow-2xl mt-4 max-w-full">
      {/* MacOS Style Header */}
      <div className="px-4 py-3 bg-[#1f1f22] border-b border-[#27272a] flex items-center justify-between">
        <div className="flex gap-1.5 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]" />
        </div>
        {filename && (
          <span className="text-[11px] font-mono font-medium text-[#a1a1aa]">
            {filename}
          </span>
        )}
      </div>

      {/* Code Body */}
      <div className="relative p-5 font-mono text-[13px] leading-relaxed overflow-x-auto w-full custom-scrollbar">
        {highlightCode(code)}

        {/* Animated Copy Button */}
        <button
          type="button"
          onClick={copyToClipboard}
          className={cn(
            "absolute right-3 top-3 p-2 rounded-lg backdrop-blur-md transition-all border",
            copied
              ? "bg-[#27c93f]/20 text-[#27c93f] border-[#27c93f]/30"
              : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border-white/5 hover:border-white/10 opacity-0 group-hover:opacity-100",
          )}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
