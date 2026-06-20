"use client";

import { useEffect, useState } from "react";

import ProdukForm from "@/components/ProdukForm";
import ProdukTable from "@/components/ProdukTable";

import {
  Produk,
  ProdukInput,
  getProduk,
  createProduk,
  updateProduk,
  deleteProduk,
} from "@/lib/api";

export default function ProdukPage() {
  const [produk, setProduk] =
    useState<Produk[]>([]);

  const [selectedProduk, setSelectedProduk] =
    useState<Produk | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const loadProduk = async () => {
    try {
      setLoading(true);

      const data =
        await getProduk();

      setProduk(data);

      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduk();
  }, []);

  const handleSubmit = async (
    payload: ProdukInput
  ) => {
    try {
      if (selectedProduk) {
        await updateProduk(
          selectedProduk.id,
          payload
        );

        setMessage(
          "Produk berhasil diperbarui"
        );
      } else {
        await createProduk(payload);

        setMessage(
          "Produk berhasil ditambahkan"
        );
      }

      setSelectedProduk(null);

      await loadProduk();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan data"
      );
    }
  };

  const handleDelete = async (
    id: number
  ) => {
    if (
      !window.confirm(
        "Yakin ingin menghapus?"
      )
    )
      return;

    try {
      await deleteProduk(id);

      setMessage(
        "Produk berhasil dihapus"
      );

      await loadProduk();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus"
      );
    }
  };

  const filteredProduk =
    produk.filter((item) =>
      item.nama
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <main className="container">
      <h1>CRUD Produk</h1>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      {error && (
        <div className="message error">
          {error}
        </div>
      )}

      <ProdukForm
        selectedProduk={selectedProduk}
        onSubmit={handleSubmit}
        onCancelEdit={() =>
          setSelectedProduk(null)
        }
      />

      <section
        className="card"
        style={{ marginTop: 20 }}
      >
        <h2>Daftar Produk</h2>

        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <br />
        <br />

        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <ProdukTable
            produk={filteredProduk}
            onEdit={
              setSelectedProduk
            }
            onDelete={
              handleDelete
            }
          />
        )}
      </section>
    </main>
  );
}