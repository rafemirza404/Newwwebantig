"use client";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If no hash in URL, scroll to top
    if (!hash) {
      window.scrollTo(0, 0);
    } 
    // If hash exists, scroll to that section after a small delay
    else {
      setTimeout(() => {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
