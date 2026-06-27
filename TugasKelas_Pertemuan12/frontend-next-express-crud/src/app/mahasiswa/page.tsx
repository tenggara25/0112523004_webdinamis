"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Mahasiswa {
  id: number;
  nim: string;
  nama: string;
  angkatan: number;
  foto: string | null;
  prodi_id: number;
  nama_prodi: string;
}

interface Prodi {
  id: number;
  nama_prodi: string;
}

export default function MahasiswaPage() {
  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [prodi, setProdi] = useState<Prodi[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [prodiId, setProdiId] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPage, setTotalPage] = useState(1);

  // ==========================
  // LOAD PRODI
  // ==========================

  const loadProdi = async () => {
    try {
      const response = await fetch(
        `${API_URL}/prodi`
      );

      const result = await response.json();

      setProdi(result.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================
  // LOAD MAHASISWA
  // ==========================

  const loadMahasiswa = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams();

      if (search) {
        query.set("search", search);
      }

      if (prodiId) {
        query.set("prodi_id", prodiId);
      }

      query.set("page", String(page));
      query.set("limit", String(limit));

      const response = await fetch(
        `${API_URL}/mahasiswa?${query.toString()}`
      );

      const result = await response.json();

      setMahasiswa(result.data || []);

      setTotalPage(
        result.meta?.totalPage || 1
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // SEARCH
  // ==========================

  const handleSearch = () => {
    setPage(1);
    loadMahasiswa();
  };

  // ==========================
  // INITIAL LOAD
  // ==========================

  useEffect(() => {
    loadProdi();
  }, []);

  useEffect(() => {
    loadMahasiswa();
  }, [page]);

  return (
    <div
      style={{
        padding: "30px",
      }}
    >
      <h1>
        Data Mahasiswa
      </h1>

      <hr />

      {/* SEARCH FILTER */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Cari NIM atau Nama"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            padding: "8px",
          }}
        />

        <select
          value={prodiId}
          onChange={(e) =>
            setProdiId(e.target.value)
          }
          style={{
            padding: "8px",
          }}
        >
          <option value="">
            Semua Prodi
          </option>

          {prodi.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.nama_prodi}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
        >
          Cari
        </button>
      </div>

      {/* TABLE */}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          border={1}
          cellPadding={10}
          style={{
            width: "100%",
            borderCollapse:
              "collapse",
          }}
        >
          <thead>
            <tr>
              <th>No</th>
              <th>Foto</th>
              <th>NIM</th>
              <th>Nama</th>
              <th>Prodi</th>
              <th>Angkatan</th>
            </tr>
          </thead>

          <tbody>
            {mahasiswa.length > 0 ? (
              mahasiswa.map(
                (
                  item,
                  index
                ) => (
                  <tr key={item.id}>
                    <td>
                      {(page - 1) *
                        limit +
                        index +
                        1}
                    </td>

                    <td>
                      <img
                        src={
                          item.foto
                            ? `${BACKEND_URL}/uploads/mahasiswa/${item.foto}`
                            : "/avatar-placeholder.png"
                        }
                        alt={item.nama}
                        width={48}
                        height={48}
                        style={{
                          borderRadius:
                            "50%",
                          objectFit:
                            "cover",
                        }}
                      />
                    </td>

                    <td>{item.nim}</td>

                    <td>{item.nama}</td>

                    <td>
                      {
                        item.nama_prodi
                      }
                    </td>

                    <td>
                      {
                        item.angkatan
                      }
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  Data tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* PAGINATION */}

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          alignItems:
            "center",
        }}
      >
        <button
          disabled={page <= 1}
          onClick={() =>
            setPage(page - 1)
          }
        >
          Previous
        </button>

        <span>
          Halaman {page} dari{" "}
          {totalPage}
        </span>

        <button
          disabled={
            page >= totalPage
          }
          onClick={() =>
            setPage(page + 1)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}