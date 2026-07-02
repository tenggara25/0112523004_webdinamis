"use client";

import { useEffect, useState } from "react";
import MahasiswaForm from "./MahasiswaForm";

type Prodi = { id: number; nama_prodi: string };
type Mahasiswa = {
  id: number;
  nim: string;
  nama: string;
  angkatan: number;
  foto?: string | null;
  prodi_id: number;
  nama_prodi: string;
};

type Meta = { page: number; limit: number; total: number; totalPage: number };

export default function MahasiswaTable() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [search, setSearch] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0, totalPage: 1 });
  const [editing, setEditing] = useState<Mahasiswa | null>(null);

  const fetchData = async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      search,
    });
    if (prodiId) params.set("prodi_id", prodiId);

    const res = await fetch(`http://localhost:3000/api/mahasiswa?${params.toString()}`);
    const data = await res.json();
    setMahasiswa(data.data || []);
    setMeta(data.meta || { page: 1, limit: 10, total: 0, totalPage: 1 });
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/prodi")
      .then((res) => res.json())
      .then((data) => setProdis(data.data || []));
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, search, prodiId]);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus mahasiswa ini?")) return;
    const res = await fetch(`http://localhost:3000/api/mahasiswa/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
  };

  return (
    <div className="space-y-4">
      {/* Form Tambah Mahasiswa */}
      {!editing && (
        <MahasiswaForm onSuccess={() => fetchData()} />
      )}

      {/* Form Edit Mahasiswa */}
      {editing && (
        <div className="relative">
          <MahasiswaForm initialData={editing} onSuccess={() => { setEditing(null); fetchData(); }} />
          <button className="absolute top-2 right-2 rounded bg-slate-200 px-3 py-1 text-sm" onClick={() => setEditing(null)}>Batal</button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <input className="rounded border px-3 py-2" placeholder="Cari NIM / Nama" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="rounded border px-3 py-2" value={prodiId} onChange={(e) => { setProdiId(e.target.value); setPage(1); }}>
          <option value="">Semua Prodi</option>
          {prodis.map((item) => (
            <option key={item.id} value={item.id}>{item.nama_prodi}</option>
          ))}
        </select>
      </div>

      {/* Tabel Data */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2">Foto</th>
              <th className="p-2">NIM</th>
              <th className="p-2">Nama</th>
              <th className="p-2">Prodi</th>
              <th className="p-2">Angkatan</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {mahasiswa.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">
                  {item.foto ? (
                    <img src={`http://localhost:3000/uploads/mahasiswa/${item.foto}`} alt={item.nama} className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded bg-slate-200" />
                  )}
                </td>
                <td className="p-2">{item.nim}</td>
                <td className="p-2">{item.nama}</td>
                <td className="p-2">{item.nama_prodi}</td>
                <td className="p-2">{item.angkatan}</td>
                <td className="p-2 space-x-2">
                  <button className="text-blue-600" onClick={() => setEditing(item)}>Edit</button>
                  <button className="text-red-600" onClick={() => handleDelete(item.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span>Halaman {meta.page} dari {meta.totalPage}</span>
        <div className="space-x-2">
          <button className="rounded border px-3 py-1" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Sebelumnya</button>
          <button className="rounded border px-3 py-1" disabled={page >= meta.totalPage} onClick={() => setPage((p) => p + 1)}>Selanjutnya</button>
        </div>
      </div>
    </div>
  );
}
