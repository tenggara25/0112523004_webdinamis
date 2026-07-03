"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import {
  getMahasiswa,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
  getProdi,
  Mahasiswa,
  Prodi,
} from "@/lib/api";
import Navbar from "@/components/Navbar";

export default function MahasiswaPage() {
  const router = useRouter();
  const [data, setData] = useState<Mahasiswa[]>([]);
  const [prodiList, setProdiList] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProdi, setFilterProdi] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPage: 1 });

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nim: "",
    nama: "",
    prodi_id: 0,
    angkatan: new Date().getFullYear(),
  });
  const [formError, setFormError] = useState("");

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMahasiswa({
        search,
        prodi_id: filterProdi,
        page,
        limit: 10,
      });
      setData(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      if (err.message?.includes("Token")) {
        router.replace("/login");
      }
    }
    setLoading(false);
  }, [search, filterProdi, page, router]);

  const fetchProdi = useCallback(async () => {
    try {
      const result = await getProdi();
      setProdiList(result.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    fetchProdi();
  }, [router, fetchProdi]);

  useEffect(() => {
    if (isLoggedIn()) {
      fetchData();
    }
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    try {
      if (editId) {
        await updateMahasiswa(editId, formData);
      } else {
        await createMahasiswa(formData);
      }
      setShowForm(false);
      setEditId(null);
      setFormData({ nim: "", nama: "", prodi_id: 0, angkatan: new Date().getFullYear() });
      fetchData();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan");
    }
  };

  const handleEdit = (mhs: Mahasiswa) => {
    setEditId(mhs.id);
    setFormData({
      nim: mhs.nim,
      nama: mhs.nama,
      prodi_id: mhs.prodi_id,
      angkatan: mhs.angkatan,
    });
    setShowForm(true);
    setFormError("");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMahasiswa(deleteId);
      setDeleteId(null);
      fetchData();
    } catch {
      // silent
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ nim: "", nama: "", prodi_id: 0, angkatan: new Date().getFullYear() });
    setFormError("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Data Mahasiswa</h2>
            <p className="text-text-muted text-sm mt-1">
              Kelola data mahasiswa (Protected Route - JWT Required)
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setFormData({ nim: "", nama: "", prodi_id: prodiList[0]?.id || 0, angkatan: new Date().getFullYear() });
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl cursor-pointer shadow-lg shadow-primary/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Mahasiswa
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari NIM atau nama..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            <select
              value={filterProdi}
              onChange={(e) => {
                setFilterProdi(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
            >
              <option value="">Semua Prodi</option>
              {prodiList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama_prodi}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-20 text-text-muted">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg font-medium">Tidak ada data</p>
              <p className="text-sm mt-1">Belum ada data mahasiswa yang tersedia.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-card-hover/50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">No</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">NIM</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Nama</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Prodi</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Angkatan</th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((mhs, idx) => (
                    <tr key={mhs.id} className="border-b border-border/50 hover:bg-card-hover/30">
                      <td className="px-6 py-4 text-sm text-text-muted">{(page - 1) * 10 + idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-mono text-accent">{mhs.nim}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{mhs.nama}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary-hover">
                          {mhs.nama_prodi}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted">{mhs.angkatan}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(mhs)}
                            className="p-2 rounded-lg hover:bg-primary/20 text-primary cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteId(mhs.id)}
                            className="p-2 rounded-lg hover:bg-danger/20 text-danger cursor-pointer"
                            title="Hapus"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta.totalPage > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-text-muted">
                Menampilkan {(page - 1) * 10 + 1} - {Math.min(page * 10, meta.total)} dari {meta.total} data
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm rounded-lg bg-card-hover hover:bg-input-border text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Prev
                </button>
                {Array.from({ length: meta.totalPage }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 text-sm rounded-lg cursor-pointer ${
                      p === page
                        ? "bg-primary text-white"
                        : "bg-card-hover hover:bg-input-border text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPage, p + 1))}
                  disabled={page >= meta.totalPage}
                  className="px-3 py-1.5 text-sm rounded-lg bg-card-hover hover:bg-input-border text-foreground disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-foreground mb-5">
              {editId ? "Edit Mahasiswa" : "Tambah Mahasiswa"}
            </h3>

            {formError && (
              <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 text-sm mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">NIM</label>
                <input
                  type="text"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Nama</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Program Studi</label>
                <select
                  value={formData.prodi_id}
                  onChange={(e) => setFormData({ ...formData, prodi_id: Number(e.target.value) })}
                  required
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                  <option value={0} disabled>Pilih Prodi</option>
                  {prodiList.map((p) => (
                    <option key={p.id} value={p.id}>{p.nama_prodi}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Angkatan</label>
                <input
                  type="number"
                  value={formData.angkatan}
                  onChange={(e) => setFormData({ ...formData, angkatan: Number(e.target.value) })}
                  required
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl cursor-pointer"
                >
                  {editId ? "Simpan Perubahan" : "Tambah"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="flex-1 py-2.5 bg-card-hover hover:bg-input-border text-foreground font-medium rounded-xl cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Hapus Mahasiswa?</h3>
            <p className="text-sm text-text-muted mb-6">
              Data yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-danger hover:bg-danger/80 text-white font-medium rounded-xl cursor-pointer"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-card-hover hover:bg-input-border text-foreground font-medium rounded-xl cursor-pointer"
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
