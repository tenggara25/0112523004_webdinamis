"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUser, getToken } from "@/lib/auth";
import Navbar from "@/components/Navbar";

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  created_at: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "viewer" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{ name: string; pass: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/users?search=${encodeURIComponent(q)}&limit=50`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setUsers(result.data);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    const u = getUser();
    if (u.role !== "admin") { alert("Akses ditolak!"); router.replace("/mahasiswa"); return; }
    setCurrentUser(u);
    fetchUsers();
  }, [router, fetchUsers]);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(search), 350);
    return () => clearTimeout(t);
  }, [search, fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    const isEdit = !!editId;
    const url = isEdit ? `${process.env.NEXT_PUBLIC_API_URL}/users/${editId}` : `${process.env.NEXT_PUBLIC_API_URL}/users`;
    const payload = isEdit ? { name: formData.name, email: formData.email, role: formData.role } : formData;
    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setShowForm(false);
      setEditId(null);
      showToast(isEdit ? "User berhasil diperbarui" : "User berhasil ditambahkan");
      fetchUsers(search);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (u: User) => {
    setEditId(u.id);
    setFormData({ name: u.name, email: u.email, password: "", role: u.role });
    setFormError("");
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${deleteId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setDeleteId(null);
      showToast("User berhasil dihapus");
      fetchUsers(search);
    } catch (err: any) {
      showToast(err.message, "error");
      setDeleteId(null);
    }
  };

  const handleResetPassword = async (u: User) => {
    if (!confirm(`Reset password untuk "${u.name}"?`)) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${u.id}/reset-password`, {
        method: "PATCH", headers: { Authorization: `Bearer ${getToken()}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setTempPasswordInfo({ name: u.name, pass: result.temporaryPassword });
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-400 border border-rose-500/30",
      operator: "bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-400 border border-indigo-500/30",
      viewer: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30",
    };
    return styles[role] || "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-right fade-in duration-300 ${toast.type === "success" ? "bg-emerald-500/90 text-white" : "bg-rose-500/90 text-white"}`}>
          {toast.msg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Manajemen User</h2>
            <p className="text-text-muted text-sm mt-1">Admin Panel — Kelola hak akses & kredensial pengguna sistem</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setFormData({ name: "", email: "", password: "", role: "viewer" }); setFormError(""); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl cursor-pointer transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40">
            <span className="text-lg">+</span> Tambah User Baru
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">🔍</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, email, atau role..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" />
          </div>
        </div>

        {/* Password Sementara */}
        {tempPasswordInfo && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-5 mb-6 animate-in slide-in-from-top fade-in duration-300">
            <h4 className="text-emerald-400 font-bold text-lg mb-2">✅ Password Sementara Berhasil Dibuat</h4>
            <p className="text-sm text-text-muted mb-3">Salin password di bawah untuk <strong className="text-foreground">{tempPasswordInfo.name}</strong>. Notifikasi ini hanya tampil sekali.</p>
            <div className="flex items-center gap-3 bg-card px-4 py-3 rounded-xl border border-border w-max">
              <code className="text-lg text-amber-400 font-mono font-bold tracking-wider">{tempPasswordInfo.pass}</code>
              <button onClick={() => { navigator.clipboard.writeText(tempPasswordInfo.pass); showToast("Password disalin!"); }}
                className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-xs font-medium rounded-lg cursor-pointer transition-all">
                📋 Salin
              </button>
            </div>
            <button onClick={() => setTempPasswordInfo(null)} className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg cursor-pointer transition-all">
              Saya Sudah Menyalin
            </button>
          </div>
        )}

        {/* Tabel */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-text-muted gap-2">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-sm">Memuat data...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-text-muted">
              <span className="text-4xl block mb-3">👤</span>
              {search ? "Tidak ada user yang cocok dengan pencarian." : "Belum ada data user."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gradient-to-r from-slate-800/50 to-slate-900/50 text-left">
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">No</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Terdaftar</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className="border-b border-border/30 hover:bg-indigo-500/5 transition-all group">
                      <td className="px-6 py-4 text-sm text-text-muted">{i + 1}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                          {currentUser?.id === u.id && <span className="text-[10px] bg-amber-500/20 text-amber-400 font-medium px-2 py-0.5 rounded-full">Anda</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted">{u.email}</td>
                      <td className="px-6 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleBadge(u.role)}`}>{u.role}</span></td>
                      <td className="px-6 py-4 text-sm text-text-muted">{new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(u)} className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-400 text-xs font-medium rounded-lg cursor-pointer transition-all" title="Edit">✏️ Edit</button>
                          <button onClick={() => handleResetPassword(u)} className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 text-xs font-medium rounded-lg cursor-pointer transition-all" title="Reset Password">🔑 Reset</button>
                          {currentUser?.id !== u.id && (
                            <button onClick={() => setDeleteId(u.id)} className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 text-xs font-medium rounded-lg cursor-pointer transition-all" title="Hapus">🗑️ Hapus</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && users.length > 0 && (
            <div className="px-6 py-3 border-t border-border/50 text-xs text-text-muted text-right">
              Total: <strong className="text-foreground">{users.length}</strong> user
            </div>
          )}
        </div>
      </main>

      {/* Modal Tambah/Edit */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-foreground mb-5">{editId ? "✏️ Ubah Data User" : "➕ Tambah User Baru"}</h3>
            {formError && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-sm mb-4">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Nama Lengkap</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="Masukkan nama lengkap" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="email@contoh.com" />
              </div>
              {!editId && (
                <div>
                  <label className="block text-sm text-text-muted mb-1.5">Password Awal</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required
                      className="w-full px-4 py-2.5 pr-12 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" placeholder="Minimal 6 karakter" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground cursor-pointer text-sm">{showPassword ? "🙈" : "👁️"}</button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Role Akses</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all">
                  <option value="viewer">👀 Viewer (Hanya Melihat)</option>
                  <option value="operator">🛠️ Operator (Kelola Mahasiswa)</option>
                  <option value="admin">🔐 Admin (Akses Penuh)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="submit" disabled={formLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl cursor-pointer font-semibold transition-all disabled:opacity-50 shadow-lg">
                  {formLoading ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Simpan User"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="flex-1 py-2.5 bg-card-hover hover:bg-slate-600 text-foreground rounded-xl cursor-pointer transition-all">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <span className="text-4xl block mb-3">⚠️</span>
            <h3 className="text-lg font-bold text-foreground mb-2">Hapus User?</h3>
            <p className="text-sm text-text-muted mb-6">Pengguna yang dihapus tidak dapat login kembali ke sistem.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl cursor-pointer font-semibold transition-all">Ya, Hapus</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-card-hover hover:bg-slate-600 text-foreground rounded-xl cursor-pointer transition-all">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
