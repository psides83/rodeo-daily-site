"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "./app-shell";

export function SiteNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Home and news already own their app layouts.
  if (pathname === "/" || pathname === "/news" || pathname.startsWith("/news/")) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
