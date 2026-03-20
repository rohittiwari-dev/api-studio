import hljs from "highlight.js";
import { Code, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";
import Editor from "react-simple-code-editor";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const JsonAndRawBodyComponent = ({
  type,
  onChange,
  value,
}: {
  type: "raw" | "json";
  onChange: (value: string | Record<string, any>) => void;
  value: Record<string, any> | string;
}) => {
  const [error, setError] = React.useState<string>("");
  const [data, setData] = React.useState<string>("");
  const { resolvedTheme } = useTheme();

  const [prevValue, setPrevValue] = React.useState(value);
  const [prevType, setPrevType] = React.useState(type);

  if (value !== prevValue || type !== prevType) {
    const newData =
      type === "json"
        ? JSON.stringify(value || {}, null, 4)
        : value?.toString() || "";
    setData(newData);
    setPrevValue(value);
    setPrevType(type);
  }

  const validateJson = (code: string) => {
    try {
      if (code?.trim()) {
        JSON.parse(code);
      }
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleChange = (code: string) => {
    if (type === "json") {
      validateJson(code);
      setData(code);
      try {
        if (code?.trim()) {
          onChange(JSON.parse(code) as Record<string, any>);
        }
      } catch (_e) {}
    } else {
      onChange(code);
      setData(code);
    }
  };

  const highlight = (code: string) => {
    try {
      const result = hljs.highlight(code, { language: "json" });
      return result.value;
    } catch {
      return hljs.highlightAuto(code).value;
    }
  };

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(data);
      handleChange(JSON.stringify(parsed, null, 4));
    } catch (_e) {
      // Ignore error if JSON is invalid
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(data);
      handleChange(JSON.stringify(parsed));
    } catch (_e) {
      // Ignore error if JSON is invalid
    }
  };

  return (
    <div className="flex flex-col gap-2 h-full w-full min-h-0">
      <link
        rel="stylesheet"
        href={
          resolvedTheme === "dark"
            ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/tokyo-night-dark.min.css"
            : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/intellij-light.min.css"
        }
        crossOrigin="anonymous"
      />

      {/* Action Buttons */}
      {type === "json" && (
        <div className="absolute top-2 right-3 z-10 flex items-center gap-0.5 bg-background/90 backdrop-blur-sm p-1 rounded-lg border border-border/50 shadow-sm">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handlePrettify}
                  className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary transition-all"
                  disabled={!data || !!error}
                >
                  <Sparkles className="size-3.5" />
                  <span className="sr-only">Prettify</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p className="font-semibold">Prettify</p>
                <p className="text-[10px] text-muted-foreground">
                  Format JSON with indentation
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleMinify}
                  className="h-7 w-7 rounded-md hover:bg-primary/10 hover:text-primary transition-all"
                  disabled={!data || !!error}
                >
                  <Code className="size-3.5" />
                  <span className="sr-only">Minify</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p className="font-semibold">Minify</p>
                <p className="text-[10px] text-muted-foreground">
                  Remove whitespace from JSON
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      <div className="relative flex-1 min-h-0 h-full w-full">
        <Editor
          value={data}
          lang={type === "json" ? "json" : "text"}
          onValueChange={handleChange}
          highlight={highlight}
          padding={4}
          spellCheck={true}
          tabSize={4}
          style={{
            lineHeight: "1.4",
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            color: resolvedTheme === "dark" ? "#becad3ff" : "#45505eff",
            border: error
              ? resolvedTheme === "dark"
                ? "0.5px solid #961838ff"
                : "0.5px solid #f18199ff"
              : resolvedTheme === "dark"
                ? "0.5px solid #202327ff"
                : "0.5px solid #dee6f0ff",
            borderRadius: "6px",
            height: "100%",
            overflow: "auto",
          }}
          textareaClassName="focus:outline-none resize-none !text-xs"
          preClassName="language-json !text-xs"
          name="code-editor"
          id="code-editor"
          aria-label="Code Editor"
          textareaId="code-editor-textarea"
        />
      </div>
      {error && (
        <div className="px-2 text-xs text-rose-500/70 shrink-0">
          Invalid JSON: {error}
        </div>
      )}
    </div>
  );
};

export default JsonAndRawBodyComponent;
