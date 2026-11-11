"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryNavigation = [
  { label: "Standings", href: "/?tab=standings" },
  { label: "Results", href: "/?tab=results" },
  { label: "Schedule", href: "/?tab=schedule" },
  { label: "News", href: "/news" },
  { label: "More", href: "/?tab=more" }
];

export function SiteNavigation() {
  const pathname = usePathname();

  // The app and news already render their own navigation.
  if (pathname === "/" || pathname === "/news" || pathname.startsWith("/news/")) {
    return null;
  }

  return (
    <header className="site-navigation">
      <div className="site-navigation-inner">
        <Link className="site-navigation-brand" href="/">Rodeo Daily</Link>
        <nav aria-label="Primary navigation">
          {primaryNavigation.map(({ label, href }) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
