"use client";

import { Produk } from "@/lib/api";

type Props = {
  produk: Produk[];
  onEdit: (item: Produk) => void;
  onDelete: (id: number) => Promise<void>;
};

export default function ProdukTable({
  produk,
  onEdit,
  onDelete,
}: Props) {
  if (produk.length === 0) {
    return <p>Belum ada data produk.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama</th>
          <th>Harga</th>
          <th>Stok</th>
          <th>Aksi</th>
        </tr>
      </thead>

      <tbody>
        {produk.map((item, index) => (
          <tr key={item.id}>
            <td>{index + 1}</td>

            <td>{item.nama}</td>

            <td>
              Rp{" "}
              {item.harga.toLocaleString(
                "id-ID"
              )}
            </td>

            <td>{item.stok}</td>

            <td>
              <div className="actions">
                <button
                  className="btn-secondary"
                  onClick={() =>
                    onEdit(item)
                  }
                >
                  Edit
                </button>

                <button
                  className="btn-danger"
                  onClick={() =>
                    onDelete(item.id)
                  }
                >
                  Hapus
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}