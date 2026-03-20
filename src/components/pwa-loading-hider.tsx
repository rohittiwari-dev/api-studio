"use client";

import { useEffect } from "react";

/**
 * Once React hydrates, mark the body as loaded so the inline
 * CSS splash screen fades out and app content is revealed.
 */
export function PWALoadingHider() {
  useEffect(() => {
    document.body.setAttribute("data-loaded", "true");
  }, []);

  return null;
}
