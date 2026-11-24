import type { ReactNode } from "react";
import { AppShell } from "./app-shell";

export function NewsAppShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return <AppShell title={title} subtitle={subtitle}>{children}</AppShell>;
}
