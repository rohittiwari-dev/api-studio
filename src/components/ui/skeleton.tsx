import { cn } from "@/lib/utils/index";

/**
 * Loading placeholder with a shimmer sweep.
 *
 * Used for `<Suspense>` fallbacks so a navigation paints structure
 * immediately while the real content streams in. Pass `pulse` for the plain
 * fade when a sweep would be distracting (very small or very dense elements).
 */
function Skeleton({
  className,
  pulse = false,
  ...props
}: React.ComponentProps<"div"> & { pulse?: boolean }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-accent/60",
        pulse
          ? "animate-pulse"
          : [
              "after:absolute after:inset-0 after:-translate-x-full",
              "after:animate-skeleton-shimmer",
              "after:bg-linear-to-r after:from-transparent after:via-foreground/10 after:to-transparent",
            ],
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
