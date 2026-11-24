"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, ListOrdered, Newspaper, Trophy } from "lucide-react";

const primaryNavigation = [
  { label: "Standings", href: "/?tab=standings", icon: ListOrdered, matches: /standings|^\/athletes\// },
  { label: "Results", href: "/?tab=results", icon: Trophy, matches: /results/ },
  { label: "Schedule", href: "/?tab=schedule", icon: CalendarDays, matches: /^\/schedule/ },
  { label: "News", href: "/news", icon: Newspaper, matches: /^\/news/ },
  { label: "More", href: "/?tab=more", icon: LayoutGrid, matches: /^\/(listings|past-champions|about|support|privacy|ios-app)(\/|$)/ }
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
        <Link className="site-navigation-brand" href="/" aria-label="Rodeo Daily home">
          <span className="site-navigation-mark" aria-hidden="true">RD</span>
          <span className="site-navigation-wordmark">Rodeo Daily<span>Your daily rodeo connection</span></span>
        </Link>
        <nav aria-label="Primary navigation">
          {primaryNavigation.map(({ label, href, icon: Icon, matches }) => (
            <Link key={href} href={href} aria-current={matches.test(pathname) ? "location" : undefined}>
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
