"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAuth } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Login gagal");
        setLoading(false);
        return;
      }

      saveAuth(result.token, result.user);
      router.push("/mahasiswa");
    } catch {
      setError("Tidak dapat terhubung ke server");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Selamat Datang</h1>
          <p className="text-text-muted mt-2">Masuk ke Sistem Akademik</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/20">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-2">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required
                className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-medium text-text-muted">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary-hover font-semibold">Lupa password?</Link>
              </div>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" required
                className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-primary/25 transition-all">
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-muted text-sm">
              Belum punya akun?{" "}
              <Link href="/register" className="text-primary hover:text-primary-hover font-medium">Daftar disini</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
