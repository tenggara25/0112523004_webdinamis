const API_URL = process.env.NEXT_PUBLIC_API_URL;
 
export type Mahasiswa = {
  id: number;
  nim: string;
  nama: string;
  prodi_id: number;
  nama_prodi: string;
  angkatan: number;
  foto?: string | null;
};
 
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
 
  const response = await fetch(`${API_URL}/mahasiswa?${query.toString()}`);
  const result = await response.json();
 
  if (!response.ok) throw new Error(result.message);
  return result;
}
 
export async function createMahasiswa(formData: FormData) {
  const response = await fetch(`${API_URL}/mahasiswa`, {
    method: "POST",
    body: formData,
  });
 
  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result;
}
