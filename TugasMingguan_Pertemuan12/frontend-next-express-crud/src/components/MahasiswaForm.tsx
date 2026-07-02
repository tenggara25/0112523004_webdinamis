"use client";

import { useEffect, useState } from "react";

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

type Props = {
  initialData?: Mahasiswa | null;
  onSuccess: () => void;
};

export default function MahasiswaForm({ initialData, onSuccess }: Props) {
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [angkatan, setAngkatan] = useState("");
  const [prodiId, setProdiId] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [prodis, setProdis] = useState<Prodi[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3000/api/prodi")
      .then((res) => res.json())
      .then((data) => setProdis(data.data || []));
  }, []);

  useEffect(() => {
    if (initialData) {
      setNim(initialData.nim);
      setNama(initialData.nama);
      setAngkatan(String(initialData.angkatan));
      setProdiId(String(initialData.prodi_id));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("nim", nim);
    formData.append("nama", nama);
    formData.append("angkatan", angkatan);
    formData.append("prodi_id", prodiId);
    if (foto) formData.append("foto", foto);

    const url = initialData
      ? `http://localhost:3000/api/mahasiswa/${initialData.id}`
      : "http://localhost:3000/api/mahasiswa";
    const method = initialData ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      onSuccess();
      setNim("");
      setNama("");
      setAngkatan("");
      setProdiId("");
      setFoto(null);
    } else {
      alert(data.message || "Gagal menyimpan data");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4 shadow-sm">
      <h2 className="text-lg font-semibold">{initialData ? "Edit Mahasiswa" : "Tambah Mahasiswa"}</h2>
      <input className="w-full rounded border px-3 py-2" value={nim} onChange={(e) => setNim(e.target.value)} placeholder="NIM" required />
      <input className="w-full rounded border px-3 py-2" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama" required />
      <input className="w-full rounded border px-3 py-2" value={angkatan} onChange={(e) => setAngkatan(e.target.value)} placeholder="Angkatan" required />
      <select className="w-full rounded border px-3 py-2" value={prodiId} onChange={(e) => setProdiId(e.target.value)} required>
        <option value="">Pilih Prodi</option>
        {prodis.map((item) => (
          <option key={item.id} value={item.id}>{item.nama_prodi}</option>
        ))}
      </select>
      <input type="file" accept="image/*" onChange={(e) => setFoto(e.target.files?.[0] || null)} />
      <button className="rounded bg-blue-600 px-4 py-2 text-white" disabled={loading}>
        {loading ? "Menyimpan..." : initialData ? "Update" : "Simpan"}
      </button>
    </form>
  );
}
