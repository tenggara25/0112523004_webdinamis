import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type Mahasiswa = {
  id: number;
  nim: string;
  nama: string;
  prodi_id: number;
  nama_prodi: string;
  angkatan: number;
};

export type Prodi = {
  id: number;
  nama_prodi: string;
};

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export async function getMahasiswa(params: {
  search?: string;
  prodi_id?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.prodi_id) query.set("prodi_id", params.prodi_id);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const response = await fetch(`${API_URL}/mahasiswa?${query.toString()}`, {
    headers: authHeaders(),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result;
}

export async function createMahasiswa(data: {
  nim: string;
  nama: string;
  prodi_id: number;
  angkatan: number;
}) {
  const response = await fetch(`${API_URL}/mahasiswa`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result;
}

export async function updateMahasiswa(
  id: number,
  data: { nim: string; nama: string; prodi_id: number; angkatan: number }
) {
  const response = await fetch(`${API_URL}/mahasiswa/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result;
}

export async function deleteMahasiswa(id: number) {
  const response = await fetch(`${API_URL}/mahasiswa/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result;
}

export async function getProdi(): Promise<{ data: Prodi[] }> {
  const response = await fetch(`${API_URL}/prodi`, {
    headers: authHeaders(),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result;
}
