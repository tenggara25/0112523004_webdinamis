'use client';

export default function DeleteButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm('Yakin ingin menghapus data ini?')) {
          e.preventDefault();
        }
      }}
      className="text-red-500 hover:text-red-700 text-sm font-medium"
    >
      Hapus
    </button>
  );
}