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
  const [userStats, setUserStats] = useState<{ weight?: number; bodyFat?: number } | null>(null);

  useEffect(() => {
    const fetchUnread = () =>
      fetch("/api/notifications/unread")
        .then((r) => r.json())
        .then((d) => setUnread(d.count ?? 0))
        .catch(() => undefined);

    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);

    fetch("/api/body-comp?latest=true")
      .then((r) => r.json())
      .then((d) => setUserStats({ weight: d.weight_lbs, bodyFat: d.body_fat_pct }))
      .catch(() => undefined);

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
        <p className="type-micro text-text-muted">
          {userStats?.weight != null || userStats?.bodyFat != null
            ? [
                userStats.weight != null ? `${userStats.weight} lbs` : null,
                userStats.bodyFat != null ? `${userStats.bodyFat}% BF` : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : "No body comp data"}
        </p>
      </div>
    </nav>
  );
}
