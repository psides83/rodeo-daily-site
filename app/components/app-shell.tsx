"use client";

import { Calendar, CircleDollarSign, ListOrdered, MonitorSmartphone, Newspaper, Settings, ShieldCheck, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { RodeoDailyLogoMark } from "./rodeo-views";

const primaryTabs = [
  { label: "Standings", href: "/?tab=standings", icon: ListOrdered },
  { label: "Results", href: "/?tab=results", icon: CircleDollarSign },
  { label: "Schedule", href: "/?tab=schedule", icon: Calendar },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "More", href: "/?tab=more", icon: Settings }
];
const desktopTabs = primaryTabs.filter((item) => item.label !== "More");
const bottomTabs = primaryTabs.filter((item) => item.label !== "Schedule");

const moreLinks = [
  { label: "Schedule", href: "/?tab=more&section=schedule", icon: Calendar },
  { label: "Favorite Athletes", href: "/?tab=more&section=favorites", icon: Users },
  { label: "NFR Standings", href: "/?tab=more&section=nfr", icon: Trophy },
  { label: "Rodeo Listings", href: "/?tab=more&section=listings", icon: Newspaper },
  { label: "Past Champions", href: "/past-champions", icon: ShieldCheck },
  { label: "Settings", href: "/?tab=more&section=settings", icon: Settings }
];

export function AppShell({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  const pathname = usePathname();
  const activeTab = /results/.test(pathname) ? "Results"
    : /standings|^\/athletes\//.test(pathname) ? "Standings"
    : pathname.startsWith("/schedule") ? "Schedule"
    : pathname.startsWith("/news") ? "News" : "More";
  const activeMore = pathname.startsWith("/listings") || pathname === "/rodeo-listings" ? "Rodeo Listings"
    : pathname === "/nfr-standings" ? "NFR Standings"
    : pathname === "/past-champions" ? "Past Champions" : null;
  const isActive = (label: string) => activeMore ? label === activeMore : label === activeTab;
  return (
    <div className="browser-stage news-browser-stage shared-app-stage">
      <section className="app-window" aria-label="Rodeo Daily">
        <header className="top-toolbar">
          <Link className="identity shared-app-brand" href="/" aria-label="Rodeo Daily home">
            <RodeoDailyLogoMark />
            <div>
              <strong>Rodeo Daily</strong>
            </div>
          </Link>
        </header>

        <div className="content-grid">
          <aside className="sidebar" aria-label="Primary">
            <div className="sidebar-title">
              <span>Tabs</span>
            </div>
            {desktopTabs.map((item) => {
              const Icon = item.icon;
              return (
                <Link className={isActive(item.label) ? "sidebar-tab active" : "sidebar-tab"} aria-current={isActive(item.label) ? "location" : undefined} href={item.href} key={item.label}>
                  <Icon size={19} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="sidebar-title sidebar-title-spaced">
              <span>More</span>
            </div>
            {moreLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link className={isActive(item.label) ? "sidebar-tab active" : "sidebar-tab"} aria-current={isActive(item.label) ? "location" : undefined} href={item.href} key={item.label}>
                  <Icon size={19} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Link className="sidebar-tab" href="/ios-app">
              <MonitorSmartphone size={19} />
              <span>iOS App</span>
            </Link>
          </aside>

          <section className="phone-surface">
            {title && <div className="native-header">
              <div>
                <strong className="native-header-title">{title}</strong>
                <p>{subtitle}</p>
              </div>
            </div>}

            <div className={title ? "tab-scroll" : "shared-page-content"}>
              {children}
            </div>

            <nav className="tab-bar news-tab-bar" aria-label="Bottom tabs">
              <div className="tab-items">
                {bottomTabs.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link className={(item.label === activeTab || (activeMore && item.label === "More")) ? "tab-button active" : "tab-button"} href={item.href} key={item.label}>
                      <Icon size={21} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </section>
        </div>
      </section>
    </div>
  );
}
