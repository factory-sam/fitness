"use client";

import { useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl text-gold tracking-tight">Vitruvian</h1>
          <p className="type-label text-text-muted mt-1">Fitness Tracker</p>
        </div>

        {success ? (
          <div className="card text-center space-y-3">
            <h2 className="section-heading">Check your email</h2>
            <p className="type-secondary text-text-secondary">
              We sent a confirmation link to <span className="text-text">{email}</span>.
              Click it to activate your account.
            </p>
            <Link
              href="/login"
              className="inline-block font-mono text-sm text-gold hover:text-gold-bright transition-colors mt-2"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="card space-y-4">
            <h2 className="section-heading text-center">Create Account</h2>

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
                minLength={6}
                className="w-full font-mono text-sm bg-bg-input border border-border rounded-md px-3 py-2.5 text-text placeholder:text-text-muted focus:outline-none focus:border-gold-dim transition-colors"
                placeholder="Min 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-mono text-sm py-2.5 rounded-md bg-gold text-bg font-semibold hover:bg-gold-bright disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>

            <p className="type-micro text-text-muted text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-gold hover:text-gold-bright transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
