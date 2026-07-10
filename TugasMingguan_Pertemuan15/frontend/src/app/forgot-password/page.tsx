"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/request-reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memproses permintaan");
      }

      setMessage(result.message);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Background Ornamen */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Lupa Password?</h1>
          <p className="text-text-muted mt-2">
            Kami akan mengirimkan link untuk mengatur ulang password Anda
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleRequestReset} className="space-y-5">
            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 text-sm">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-2">
                Alamat Email Terdaftar
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg transition-all"
            >
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-primary hover:text-primary-hover font-medium text-sm">
              ← Kembali ke halaman Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
