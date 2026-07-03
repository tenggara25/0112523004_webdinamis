"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { getMahasiswa, createMahasiswa, updateMahasiswa, deleteMahasiswa, getProdi, Mahasiswa, Prodi } from "@/lib/api";
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
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nim: "", nama: "", prodi_id: 0, angkatan: 2024 });
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMahasiswa({ search, prodi_id: filterProdi, page, limit: 10 });
      setData(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      if (err.message?.includes("Token")) router.replace("/login");
    }
    setLoading(false);
  }, [search, filterProdi, page, router]);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    getProdi().then(r => setProdiList(r.data)).catch(() => {});
  }, [router]);

  useEffect(() => { if (isLoggedIn()) fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editId) await updateMahasiswa(editId, formData);
      else await createMahasiswa(formData);
      setShowForm(false);
      setEditId(null);
      fetchData();
    } catch (err: any) { setFormError(err.message); }
  };

  const handleEdit = (m: Mahasiswa) => {
    setEditId(m.id);
    setFormData({ nim: m.nim, nama: m.nama, prodi_id: m.prodi_id, angkatan: m.angkatan });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMahasiswa(deleteId).catch(() => {});
    setDeleteId(null);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Data Mahasiswa</h2>
            <p className="text-text-muted text-sm mt-1">Protected Route - JWT Required</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setFormData({ nim: "", nama: "", prodi_id: prodiList[0]?.id || 0, angkatan: 2024 }); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl cursor-pointer">
            + Tambah Mahasiswa
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-4">
          <input type="text" placeholder="Cari NIM atau nama..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50" />
          <select value={filterProdi} onChange={(e) => { setFilterProdi(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground cursor-pointer">
            <option value="">Semua Prodi</option>
            {prodiList.map(p => <option key={p.id} value={p.id}>{p.nama_prodi}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-text-muted">Loading...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-20 text-text-muted">Tidak ada data mahasiswa.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-card-hover/50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase">No</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase">NIM</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase">Nama</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase">Prodi</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-text-muted uppercase">Angkatan</th>
                    <th className="text-center px-6 py-4 text-xs font-semibold text-text-muted uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((m, i) => (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-card-hover/30">
                      <td className="px-6 py-4 text-sm text-text-muted">{(page-1)*10+i+1}</td>
                      <td className="px-6 py-4 text-sm font-mono text-accent">{m.nim}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{m.nama}</td>
                      <td className="px-6 py-4 text-sm"><span className="px-2.5 py-1 rounded-full text-xs bg-primary/15 text-primary-hover">{m.nama_prodi}</span></td>
                      <td className="px-6 py-4 text-sm text-text-muted">{m.angkatan}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleEdit(m)} className="p-2 rounded-lg hover:bg-primary/20 text-primary cursor-pointer mr-1" title="Edit">✏️</button>
                        <button onClick={() => setDeleteId(m.id)} className="p-2 rounded-lg hover:bg-danger/20 text-danger cursor-pointer" title="Hapus">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {meta.totalPage > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-text-muted">Hal {page} dari {meta.totalPage} ({meta.total} data)</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1} className="px-3 py-1.5 text-sm rounded-lg bg-card-hover text-foreground disabled:opacity-30 cursor-pointer">Prev</button>
                <button onClick={() => setPage(p => Math.min(meta.totalPage, p+1))} disabled={page >= meta.totalPage} className="px-3 py-1.5 text-sm rounded-lg bg-card-hover text-foreground disabled:opacity-30 cursor-pointer">Next</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-foreground mb-5">{editId ? "Edit" : "Tambah"} Mahasiswa</h3>
            {formError && <div className="bg-danger/10 text-danger rounded-xl px-4 py-3 text-sm mb-4">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1.5">NIM</label>
                <input value={formData.nim} onChange={e => setFormData({...formData, nim: e.target.value})} required className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Nama</label>
                <input value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} required className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Prodi</label>
                <select value={formData.prodi_id} onChange={e => setFormData({...formData, prodi_id: Number(e.target.value)})} required className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground cursor-pointer">
                  <option value={0} disabled>Pilih Prodi</option>
                  {prodiList.map(p => <option key={p.id} value={p.id}>{p.nama_prodi}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Angkatan</label>
                <input type="number" value={formData.angkatan} onChange={e => setFormData({...formData, angkatan: Number(e.target.value)})} required className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl cursor-pointer">{editId ? "Simpan" : "Tambah"}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 py-2.5 bg-card-hover text-foreground rounded-xl cursor-pointer">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold text-foreground mb-2">Hapus Mahasiswa?</h3>
            <p className="text-sm text-text-muted mb-6">Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-danger text-white rounded-xl cursor-pointer">Ya, Hapus</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-card-hover text-foreground rounded-xl cursor-pointer">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
