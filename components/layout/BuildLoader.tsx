"use client";

import { useEffect, useState } from "react";
import { GlobalLoader } from "./GlobalLoader";

export function BuildLoader() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleLoad = () => {
      setIsInitialLoad(false);
      setIsBuilding(false);
    };

    const handleBeforeUnload = () => {
      setIsBuilding(true);
    };

    // Set initial load to false after page is ready
    if (document.readyState === "complete") {
      setIsInitialLoad(false);
    } else {
      window.addEventListener("load", handleLoad);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

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

  return null;
}
