"use client";

import { useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl text-gold tracking-tight">Vitruvian</h1>
          <p className="type-label text-text-muted mt-1">Fitness Tracker</p>
        </div>

        <form onSubmit={handleLogin} className="card space-y-4">
          <h2 className="section-heading text-center">Sign In</h2>

          {error && (
            <div className="border border-error/50 rounded-md bg-error/10 px-3 py-2">
              <p className="type-micro text-error">{error}</p>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="type-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full font-mono text-sm bg-bg-input border border-border rounded-md px-3 py-2.5 text-text placeholder:text-text-muted focus:outline-none focus:border-gold-dim transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="type-label">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full font-mono text-sm bg-bg-input border border-border rounded-md px-3 py-2.5 text-text placeholder:text-text-muted focus:outline-none focus:border-gold-dim transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-mono text-sm py-2.5 rounded-md bg-gold text-bg font-semibold hover:bg-gold-bright disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p className="type-micro text-text-muted text-center">
            No account?{" "}
            <Link href="/signup" className="text-gold hover:text-gold-bright transition-colors">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
