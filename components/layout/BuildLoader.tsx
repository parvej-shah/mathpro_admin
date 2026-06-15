"use client";

import { useEffect, useState } from "react";
import { GlobalLoader } from "./GlobalLoader";

export function BuildLoader() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Handle initial page load
    const handleLoad = () => {
      setIsInitialLoad(false);
      setIsBuilding(false);
      setIsCompiling(false);
    };

    // Listen for Next.js HMR (Hot Module Replacement) in dev mode
    if (process.env.NODE_ENV === "development") {
      // Listen for webpack HMR events via custom events
      const handleHMR = () => {
        setIsCompiling(true);
        // Auto-hide after compilation (Next.js typically takes 200-800ms)
        setTimeout(() => {
          setIsCompiling(false);
        }, 1000);
      };

      // Listen for Next.js compilation events
      // Next.js exposes these via window events in dev mode
      if (typeof window !== "undefined") {
        // Listen for custom Next.js events
        window.addEventListener("next-compile-start", handleHMR);
        window.addEventListener("next-compile-end", () => {
          setIsCompiling(false);
        });

        // Fallback: Listen for webpack HMR messages
        const handleMessage = (event: MessageEvent) => {
          // Webpack HMR events
          if (
            event.data?.type === "webpackInvalid" ||
            event.data?.type === "webpackCompiling"
          ) {
            setIsCompiling(true);
          }
          if (
            event.data?.type === "webpackOk" ||
            event.data?.type === "webpackCompiled"
          ) {
            setTimeout(() => setIsCompiling(false), 300);
          }
        };

        window.addEventListener("message", handleMessage);

        return () => {
          window.removeEventListener("next-compile-start", handleHMR);
          window.removeEventListener("next-compile-end", () => {
            setIsCompiling(false);
          });
          window.removeEventListener("message", handleMessage);
        };
      }
    }

    // Handle page unload (building)
    const handleBeforeUnload = () => {
      setIsBuilding(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("load", handleLoad);

    // Set initial load to false after page is ready
    if (document.readyState === "complete") {
      setIsInitialLoad(false);
    } else {
      window.addEventListener("load", () => {
        setIsInitialLoad(false);
      });
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  if (
    isInitialLoad &&
    typeof window !== "undefined" &&
    document.readyState !== "complete"
  ) {
    return <GlobalLoader type="building" message="Loading application..." />;
  }

  if (isBuilding) {
    return <GlobalLoader type="building" message="Building application..." />;
  }

  if (isCompiling) {
    return <GlobalLoader type="compiling" message="Compiling..." />;
  }

  return null;
}
