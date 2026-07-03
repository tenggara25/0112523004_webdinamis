"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken, logout, isLoggedIn } from "@/lib/auth";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    setUser(getUser());
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      });
    } catch { /* silent */ }
    logout();
  };

  if (!user) return null;

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Sistem Akademik</h1>
          <p className="text-xs text-text-muted">Tugas Mingguan Pertemuan 13</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-card-hover cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-primary font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</div>
            <span className="text-sm font-medium text-foreground hidden sm:block">{user.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-accent/20 text-accent">{user.role}</span>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-text-muted">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-sm text-danger hover:bg-danger/10 cursor-pointer">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
