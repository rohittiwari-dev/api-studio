import type { MetadataRoute } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "ApiStudio",
    description: APP_DESCRIPTION,
    // Land directly in the workspace — not the sign-in page
    start_url: "/workspace",
    scope: "/",
    display: "standalone",
    // Use native window controls overlay on desktop for a real-app feel
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    orientation: "portrait-primary",
    prefer_related_applications: false,
    categories: ["developer", "productivity", "utilities"],
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/app-screenshot.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  };
}
