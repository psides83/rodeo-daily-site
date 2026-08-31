import { Calendar, CircleDollarSign, ListOrdered, MonitorSmartphone, Newspaper, Settings, ShieldCheck, Trophy, Users } from "lucide-react";
import Link from "next/link";
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
  { label: "Favorite Athletes", href: "/?tab=more&section=favorites", icon: Users },
  { label: "NFR Standings", href: "/?tab=more&section=nfr", icon: Trophy },
  { label: "Rodeo Listings", href: "/?tab=more&section=listings", icon: Newspaper },
  { label: "Past Champions", href: "/?tab=more&section=champions", icon: ShieldCheck },
  { label: "Settings", href: "/?tab=more&section=settings", icon: Settings }
];

export function NewsAppShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="browser-stage news-browser-stage">
      <section className="app-window" aria-label="Rodeo Daily news">
        <header className="top-toolbar">
          <div className="identity">
            <RodeoDailyLogoMark />
            <div>
              <strong>Rodeo Daily</strong>
            </div>
          </div>
        </header>

        <div className="content-grid">
          <aside className="sidebar" aria-label="Primary">
            <div className="sidebar-title">
              <span>Tabs</span>
            </div>
            {desktopTabs.map((item) => {
              const Icon = item.icon;
              return (
                <Link className={item.label === "News" ? "sidebar-tab active" : "sidebar-tab"} href={item.href} key={item.label}>
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
                <Link className="sidebar-tab" href={item.href} key={item.label}>
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
            <div className="native-header">
              <div>
                <h1>{title}</h1>
                <p>{subtitle}</p>
              </div>
            </div>

            <div className="tab-scroll">
              {children}
            </div>

            <nav className="tab-bar news-tab-bar" aria-label="Bottom tabs">
              <div className="tab-items">
                {bottomTabs.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link className={item.label === "News" ? "tab-button active" : "tab-button"} href={item.href} key={item.label}>
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
    </main>
  );
}
