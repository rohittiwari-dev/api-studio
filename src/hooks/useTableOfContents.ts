"use client";

import { useEffect, useRef, useState } from "react";

export function useTableOfContents(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] || "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find the first intersecting entry
      const visibleSection = entries.find((entry) => entry.isIntersecting);
      if (visibleSection) {
        setActiveSection(visibleSection.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-10% 0px -70% 0px", // Trigger when section is in top part of view
      threshold: 0,
    });

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => observerRef.current?.disconnect();
  }, [sectionIds]);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        setActiveSection(id);
      }, 100);
    }
  };

  return { activeSection, scrollToSection };
}
