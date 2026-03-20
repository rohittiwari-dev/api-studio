import type { ComponentProps } from "react";
import { IconSocketIO, IconWebSocket } from "@/assets/app-icons";
import { cn } from "@/lib/utils";
import type { RequestType } from "../types/store.types";

export const RequestIcon = ({
  type,
  className,
  ...props
}: {
  type: RequestType | "NEW";
  className?: string;
} & ComponentProps<"svg">) => {
  switch (type) {
    case "WEBSOCKET":
      return <IconWebSocket className={cn("size-4", className)} {...props} />;
    case "SOCKET_IO":
      return <IconSocketIO className={cn("size-4", className)} {...props} />;
    case "NEW":
      return null;
    default:
      return <IconWebSocket className={cn("size-4", className)} {...props} />;
  }
};
