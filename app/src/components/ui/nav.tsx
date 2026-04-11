"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: "◈" },
  { href: "/workout", label: "Workout", icon: "▶" },
  { href: "/body", label: "Body", icon: "◉" },
  { href: "/programme", label: "Programme", icon: "☰" },
  { href: "/exercises", label: "Exercises", icon: "⊞" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="w-48 min-h-screen border-r border-border bg-bg-card flex flex-col py-6 px-3 shrink-0">
      <div className="mb-8 px-2">
        <h1 className="font-serif text-xl text-gold tracking-tight">Vitruvian</h1>
        <p className="font-mono text-[10px] text-text-muted mt-0.5 uppercase tracking-widest">
          Fitness Tracker
        </p>
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
          </Link>
        ))}
      </div>
      <div className="mt-auto px-2 pt-6 border-t border-border-subtle">
        <p className="font-mono text-[10px] text-text-muted">Sam</p>
        <p className="font-mono text-[10px] text-text-muted">212 lbs · 25% BF</p>
      </div>
    </nav>
  );
}
