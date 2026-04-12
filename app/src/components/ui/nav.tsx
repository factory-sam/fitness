"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const links = [
  { href: "/", label: "Dashboard", icon: "◈" },
  { href: "/workout", label: "Workout", icon: "▶" },
  { href: "/body", label: "Body", icon: "◉" },
  { href: "/supplements", label: "Supplements", icon: "⊕" },
  { href: "/programme", label: "Programme", icon: "☰" },
  { href: "/exercises", label: "Exercises", icon: "⊞" },
  { href: "/notifications", label: "Notifications", icon: "⚑" },
];

export function Nav() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications/unread")
      .then((r) => r.json())
      .then((d) => setUnread(d.count ?? 0))
      .catch(() => {});

    const interval = setInterval(() => {
      fetch("/api/notifications/unread")
        .then((r) => r.json())
        .then((d) => setUnread(d.count ?? 0))
        .catch(() => {});
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const displayUnread = useMemo(
    () => (pathname === "/notifications" ? 0 : unread),
    [pathname, unread],
  );

  return (
    <nav className="w-48 min-h-screen border-r border-border bg-bg-card flex flex-col py-6 pb-10 px-3 shrink-0">
      <div className="mb-8 px-2">
        <h1 className="font-serif text-xl text-gold tracking-tight">Vitruvian</h1>
        <p className="type-label text-text-muted mt-0.5">Fitness Tracker</p>
      </div>
      <div className="flex flex-col gap-0.5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link flex items-center gap-2.5 ${
              pathname === link.href ? "active" : ""
            }`}
          >
            <span className="text-xs opacity-50">{link.icon}</span>
            {link.label}
            {link.href === "/notifications" && displayUnread > 0 && (
              <span className="ml-auto type-micro bg-gold text-bg rounded-full px-1.5 py-0.5 leading-none">
                {displayUnread > 99 ? "99+" : displayUnread}
              </span>
            )}
          </Link>
        ))}
      </div>
      <div className="mt-auto px-2 pt-6 border-t border-border-subtle">
        <p className="type-micro text-text-muted">Sam</p>
        <p className="type-micro text-text-muted">212 lbs · 25% BF</p>
      </div>
    </nav>
  );
}
