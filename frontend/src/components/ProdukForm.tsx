"use client";

import { FormEvent, useEffect, useState } from "react";
import { Produk, ProdukInput } from "@/lib/api";

type Props = {
  selectedProduk: Produk | null;
  onSubmit: (payload: ProdukInput) => Promise<void>;
  onCancelEdit: () => void;
};

const initialForm: ProdukInput = {
  nama: "",
  harga: 0,
  stok: 0,
};

export default function ProdukForm({
  selectedProduk,
  onSubmit,
  onCancelEdit,
}: Props) {
  const [form, setForm] =
    useState<ProdukInput>(initialForm);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (selectedProduk) {
      setForm({
        nama: selectedProduk.nama,
        harga: selectedProduk.harga,
        stok: selectedProduk.stok,
      });
    } else {
      setForm(initialForm);
    }
  }, [selectedProduk]);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      await onSubmit(form);

      setForm(initialForm);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
    >
      <h2>
        {selectedProduk
          ? "Edit Produk"
          : "Tambah Produk"}
      </h2>

      <div className="grid">
        <div className="form-group">
          <label>Nama Produk</label>

          <input
            value={form.nama}
            onChange={(e) =>
              setForm({
                ...form,
                nama: e.target.value,
              })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Harga</label>

          <input
            type="number"
            value={form.harga}
            onChange={(e) =>
              setForm({
                ...form,
                harga: Number(e.target.value),
              })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Stok</label>

          <input
            type="number"
            value={form.stok}
            onChange={(e) =>
              setForm({
                ...form,
                stok: Number(e.target.value),
              })
            }
            required
          />
        </div>
      </div>

      <div className="actions">
        <button
          type="submit"
          className="btn-primary"
        >
          {loading
            ? "Menyimpan..."
            : selectedProduk
            ? "Update"
            : "Simpan"}
        </button>

        {selectedProduk && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancelEdit}
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}