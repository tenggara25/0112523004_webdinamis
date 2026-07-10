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

  // State Modal CRUD
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "viewer" });
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // State hasil reset password sementara
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{ name: string; pass: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data user");
      }
      setUsers(result.data);
    } catch (err: any) {
      alert(err.message);
      router.replace("/mahasiswa"); // Tendang kembali jika bukan admin atau gagal auth
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const user = getUser();
    if (user.role !== "admin") {
      alert("Akses ditolak: Hanya admin yang dapat mengelola user!");
      router.replace("/mahasiswa");
      return;
    }
    setCurrentUser(user);
    fetchUsers();
  }, [router, fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const isEdit = !!editId;
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/users/${editId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/users`;

    const method = isEdit ? "PUT" : "POST";
    
    // Jangan kirim password kosong saat edit (password tidak diubah lewat PUT /users/:id)
    const payload = isEdit 
      ? { name: formData.name, email: formData.email, role: formData.role }
      : formData;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setShowForm(false);
      setEditId(null);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleEdit = (u: User) => {
    setEditId(u.id);
    setFormData({ name: u.name, email: u.email, password: "", role: u.role });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setDeleteId(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (u: User) => {
    if (!confirm(`Apakah Anda yakin ingin mereset password untuk user "${u.name}"?`)) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${u.id}/reset-password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      // Tampilkan password baru yang digenerate oleh backend
      setTempPasswordInfo({ name: u.name, pass: result.temporaryPassword });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Daftar User Sistem</h2>
            <p className="text-text-muted text-sm mt-1">Admin Panel - Mengelola Hak Akses & Password</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setFormData({ name: "", email: "", password: "", role: "viewer" });
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl cursor-pointer transition-all"
          >
            + Tambah User Baru
          </button>
        </div>

        {/* Notifikasi Hasil Reset Password Sementara */}
        {tempPasswordInfo && (
          <div className="bg-success/15 border border-success/30 rounded-2xl p-5 mb-6">
            <h4 className="text-success font-bold text-lg mb-2">Password Sementara Berhasil Dibuat!</h4>
            <p className="text-sm text-text-muted mb-3">
              Salin password sementara di bawah ini untuk pengguna <strong>{tempPasswordInfo.name}</strong>. 
              Pemberitahuan ini hanya akan tampil sekali.
            </p>
            <div className="flex items-center gap-3 bg-card px-4 py-3 rounded-xl border border-border w-max font-mono text-lg text-accent">
              {tempPasswordInfo.pass}
            </div>
            <button
              onClick={() => setTempPasswordInfo(null)}
              className="mt-4 px-4 py-2 bg-success text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Saya Mengerti & Sudah Menyalin
            </button>
          </div>
        )}

        {/* Tabel User */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-text-muted">Loading data...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-text-muted">Tidak ada data user.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-card-hover/50 text-left">
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">No</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">Nama</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">Tanggal Terdaftar</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-card-hover/30 transition-all">
                      <td className="px-6 py-4 text-sm text-text-muted">{i + 1}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{u.name} {currentUser?.id === u.id && <span className="text-xs bg-accent/20 text-accent font-normal px-2 py-0.5 rounded-full ml-1.5">Anda</span>}</td>
                      <td className="px-6 py-4 text-sm text-text-muted">{u.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          u.role === "admin" ? "bg-danger/15 text-danger" :
                          u.role === "operator" ? "bg-primary/15 text-primary" :
                          "bg-accent/15 text-accent"
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted">
                        {new Date(u.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg cursor-pointer transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium rounded-lg cursor-pointer transition-all"
                          title="Reset Password Pengguna"
                        >
                          Reset Pass
                        </button>
                        {currentUser?.id !== u.id && (
                          <button
                            onClick={() => setDeleteId(u.id)}
                            className="px-3 py-1.5 bg-danger/10 hover:bg-danger/20 text-danger text-xs font-medium rounded-lg cursor-pointer transition-all"
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Tambah / Edit */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-foreground mb-5">
              {editId ? "Ubah Data" : "Tambah"} User Baru
            </h3>
            {formError && (
              <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="email@example.com"
                />
              </div>

              {!editId && (
                <div>
                  <label className="block text-sm text-text-muted mb-1.5">Password Awal</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-text-muted mb-1.5">Role Akses</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="viewer">Viewer (Hanya Melihat)</option>
                  <option value="operator">Operator (Ubah/Tambah Mahasiswa)</option>
                  <option value="admin">Admin (Akses Penuh)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl cursor-pointer font-semibold transition-all"
                >
                  {editId ? "Simpan Perubahan" : "Simpan User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  className="flex-1 py-2.5 bg-card-hover hover:bg-slate-700 text-foreground rounded-xl cursor-pointer transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Hapus User?</h3>
            <p className="text-sm text-text-muted mb-6">
              Pengguna yang dihapus tidak akan dapat masuk kembali ke sistem.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-danger hover:bg-rose-600 text-white rounded-xl cursor-pointer font-semibold transition-all"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-card-hover hover:bg-slate-700 text-foreground rounded-xl cursor-pointer transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
