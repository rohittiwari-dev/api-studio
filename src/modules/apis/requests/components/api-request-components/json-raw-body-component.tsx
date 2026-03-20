import hljs from "highlight.js";
import { useTheme } from "next-themes";
import React from "react";
import Editor from "react-simple-code-editor";

export interface JsonAndRawBodyRef {
  prettify: () => void;
  minify: () => void;
}

const JsonAndRawBodyComponent = React.forwardRef<
  JsonAndRawBodyRef,
  {
    type: "raw" | "json";
    onChange: (value: string | Record<string, any>) => void;
    value: Record<string, any> | string;
  }
>(({ type, onChange, value }, ref) => {
  const [error, setError] = React.useState<string>("");
  const [data, setData] = React.useState<string>("");
  const { resolvedTheme } = useTheme();

  const [prevValue, setPrevValue] = React.useState(value);
  const [prevType, setPrevType] = React.useState(type);

  if (value !== prevValue || type !== prevType) {
    let shouldUpdateData = false;
    if (type !== prevType) {
      shouldUpdateData = true;
    } else if (type === "json") {
      // Check if actual object content changed, ignoring formatting/reference changes
      const currentStr = JSON.stringify(value || {});
      const prevStr = JSON.stringify(prevValue || {});
      if (currentStr !== prevStr) {
        shouldUpdateData = true;
      }
    } else {
      if (value !== prevValue) {
        shouldUpdateData = true;
      }
    }

    if (shouldUpdateData) {
      const newData =
        type === "json"
          ? JSON.stringify(value || {}, null, 4)
          : value?.toString() || "";
      setData(newData);
    }

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

  React.useImperativeHandle(ref, () => ({
    prettify: handlePrettify,
    minify: handleMinify,
  }));

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

      {/* Action Buttons Lifted to Parent */}
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
});

JsonAndRawBodyComponent.displayName = "JsonAndRawBodyComponent";

export default JsonAndRawBodyComponent;
