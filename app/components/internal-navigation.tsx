"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const historyKey = "rodeoDailyInternalBack";
const InternalNavigationContext = createContext(false);

// Store eligibility on each history entry so reloads and Back/Forward retain it.
export function InternalNavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navigation, setNavigation] = useState<{ pathname: string; internal: boolean | null }>({ pathname, internal: null });

  if (navigation.pathname !== pathname) {
    setNavigation({ pathname, internal: true });
  }

  useEffect(() => {
    const entry = window.history.state;
    let internal = false;
    if (typeof entry?.[historyKey] === "boolean") {
      internal = entry[historyKey];
    } else if (document.referrer && window.history.length > 1) {
      try {
        internal = new URL(document.referrer).origin === window.location.origin;
      } catch {
        // Missing or invalid referrers do not establish an internal visit.
      }
    }
    setNavigation({ pathname: window.location.pathname, internal });

    function onPopState(event: PopStateEvent) {
      setNavigation({
        pathname: window.location.pathname,
        internal: event.state?.[historyKey] === true
      });
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (navigation.internal === null) return;
    // Preserve Next.js's own history fields.
    window.history.replaceState(
      { ...window.history.state, [historyKey]: navigation.internal },
      ""
    );
  }, [navigation]);

  return (
    <InternalNavigationContext.Provider value={navigation.internal === true}>
      {children}
    </InternalNavigationContext.Provider>
  );
}

export function useHasInternalBack() {
  return useContext(InternalNavigationContext);
}
