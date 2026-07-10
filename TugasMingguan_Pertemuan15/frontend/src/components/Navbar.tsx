"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getUser, getToken, logout, isLoggedIn } from "@/lib/auth";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    setUser(getUser());
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
    } catch {
      /* silent */
    }
    logout();
  };

  if (!user) return null;

  return (
    <nav className="bg-card border-b border-border px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-lg font-bold text-foreground">Sistem Akademik</h1>
            <p className="text-xs text-text-muted">Tugas Kelas Pertemuan 15 - CRUD User & Reset Pass</p>
          </div>

          {/* Navigasi Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/mahasiswa"
              className={`text-sm font-medium px-3 py-2 rounded-xl transition-all ${
                pathname === "/mahasiswa"
                  ? "bg-primary/20 text-primary-hover font-semibold"
                  : "text-text-muted hover:bg-card-hover hover:text-foreground"
              }`}
            >
              Data Mahasiswa
            </Link>

            {user.role === "admin" && (
              <Link
                href="/users"
                className={`text-sm font-medium px-3 py-2 rounded-xl transition-all ${
                  pathname === "/users"
                    ? "bg-primary/20 text-primary-hover font-semibold"
                    : "text-text-muted hover:bg-card-hover hover:text-foreground"
                }`}
              >
                Kelola User (Admin)
              </Link>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-card-hover cursor-pointer transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-primary font-bold text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">
              {user.name}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                user.role === "admin"
                  ? "bg-danger/20 text-danger"
                  : user.role === "operator"
                  ? "bg-primary/20 text-primary"
                  : "bg-accent/20 text-accent"
              }`}
            >
              {user.role}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-border bg-slate-850">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
              </div>

              {/* Tautan Tambahan Mobile di dropdown */}
              <div className="block md:hidden border-b border-border">
                <Link
                  href="/mahasiswa"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2.5 text-sm text-foreground hover:bg-card-hover"
                >
                  Data Mahasiswa
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/users"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-card-hover font-medium text-indigo-400"
                  >
                    Kelola User
                  </Link>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-danger hover:bg-danger/10 cursor-pointer font-medium transition-all"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
