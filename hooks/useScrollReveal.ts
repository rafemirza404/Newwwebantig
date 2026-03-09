"use client";

import { useEffect, useRef, type RefObject } from "react";

export function useScrollReveal(): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    // Observe the container and all children with m-reveal
    const revealElements = node.querySelectorAll(".m-reveal");
    revealElements.forEach((el) => observer.observe(el));
    if (node.classList.contains("m-reveal")) observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return ref;
}
