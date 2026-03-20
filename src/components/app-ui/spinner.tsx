import type React from "react";
import type { SVGProps } from "react";
import { cn } from "@/lib/utils";
import { getColorFromClass } from "@/lib/utils/colors";
import { Spinner as RawSpinner } from "../ui/spinner";

type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
type SpinnerColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

interface SpinnerProps extends Omit<SVGProps<SVGSVGElement>, "size"> {
  size?: SpinnerSize;
  color?: SpinnerColor;
  loadingLabel?: string | React.ReactNode;
  textClassName?: string;
  stroke?: string;
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
};

const colorMap = {
  default: "!text-foreground",
  primary: "!text-primary",
  secondary: "!text-secondary",
  success: "!text-green-500",
  warning: "!text-yellow-500",
  danger: "!text-red-500",
};

const Spinner = ({
  className,
  loadingLabel,
  textClassName,
  size = "md",
  color = "default",
}: SpinnerProps) => (
  <div
    className={cn(
      "flex items-center justify-center",
      !!loadingLabel && "gap-2",
      sizeMap[size],
      "w-fit!",
      className,
    )}
  >
    <RawSpinner
      color={getColorFromClass(colorMap[color]) || "currentColor"}
      className={cn(sizeMap[size])}
    />
    {loadingLabel &&
      (typeof loadingLabel === "string" ? (
        <span className={cn("text-base", textClassName)}>{loadingLabel}</span>
      ) : (
        loadingLabel
      ))}
  </div>
);

export default Spinner;
