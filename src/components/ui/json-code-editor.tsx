"use client";
import { useTheme } from "next-themes";
import type React from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

interface JsonCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * Editable JSON code editor with syntax highlighting
 * Uses overlay technique: hidden textarea for editing + highlighted div for display
 */
const JsonCodeEditor: React.FC<JsonCodeEditorProps> = ({
  value,
  onChange,
  placeholder = '{ "key": "value" }',
  className,
  onKeyDown,
}) => {
  const { resolvedTheme } = useTheme();
  const [highlightedCode, setHighlightedCode] = useState("");
  const [isHighlighting, setIsHighlighting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const cursorPositionRef = useRef<{ start: number; end: number } | null>(null);

  // Sync scroll between textarea and highlighted overlay
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Restore cursor position after value update
  useLayoutEffect(() => {
    if (cursorPositionRef.current && textareaRef.current) {
      const { start, end } = cursorPositionRef.current;
      textareaRef.current.setSelectionRange(start, end);
      cursorPositionRef.current = null;
    }
  }, []);

  // Highlight code using Shiki (debounced)
  useEffect(() => {
    if (!value?.trim()) {
      setHighlightedCode("");
      setIsHighlighting(false);
      return;
    }

    setIsHighlighting(true);

    const highlightCode = async () => {
      try {
        const { codeToHtml } = await import("shiki");
        const highlighted = await codeToHtml(value, {
          lang: "json",
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
          defaultColor: resolvedTheme === "dark" ? "dark" : "light",
        });
        setHighlightedCode(highlighted);
      } catch (_e) {
        // Fallback: just display plain text
        setHighlightedCode(`<pre><code>${escapeHtml(value)}</code></pre>`);
      } finally {
        setIsHighlighting(false);
      }
    };

    // Debounce highlighting for performance
    const timeoutId = setTimeout(highlightCode, 150);
    return () => clearTimeout(timeoutId);
  }, [value, resolvedTheme]);

  // Handle change with cursor preservation
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      // Store cursor position before the update
      cursorPositionRef.current = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      };
      onChange(textarea.value);
    },
    [onChange],
  );

  // Handle tab key for indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = `${value.substring(0, start)}  ${value.substring(end)}`;
        cursorPositionRef.current = {
          start: start + 2,
          end: start + 2,
        };
        onChange(newValue);
      }
    }
    onKeyDown?.(e);
  };

  // Determine if we should show the textarea text directly (when still highlighting)
  const showPlainText = isHighlighting || !highlightedCode;

  return (
    <div className={cn("relative h-full w-full font-mono text-sm", className)}>
      {/* Highlighted code overlay (non-interactive) */}
      <div
        ref={highlightRef}
        className={cn(
          "absolute inset-0 pointer-events-none overflow-auto whitespace-pre-wrap wrap-break-word",
          "p-3 rounded-md border border-transparent",
          "[&>pre]:bg-transparent! [&>pre]:m-0! [&>pre]:p-0!",
          "[&_code]:bg-transparent! [&_code]:text-inherit [&_code]:font-mono!",
          "[&_.line]:whitespace-pre-wrap [&_.line]:wrap-break-word",
          showPlainText && "opacity-0",
        )}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: required
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        aria-hidden="true"
      />

      {/* Editable textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className={cn(
          "absolute inset-0 w-full h-full resize-none",
          "p-3 rounded-md border bg-transparent",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary",
          "placeholder:text-muted-foreground/50 font-mono text-inherit",
          "whitespace-pre-wrap wrap-break-word",
          // Show text when no highlighting, hide when highlighted overlay is visible
          showPlainText
            ? "text-foreground caret-foreground"
            : "text-transparent caret-foreground selection:bg-primary/30",
        )}
        style={
          showPlainText ? undefined : { WebkitTextFillColor: "transparent" }
        }
      />

      {/* Placeholder when empty */}
      {!value && (
        <div className="absolute top-3 left-3 text-muted-foreground/50 font-mono pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};

// Helper to escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export default JsonCodeEditor;
