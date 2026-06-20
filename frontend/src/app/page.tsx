import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container">
      <div className="card">
        <h1>Frontend Next.js untuk Express CRUD API</h1>
        <p>
          Aplikasi ini adalah contoh frontend Next.js yang mengakses backend
          Express.js melalui REST API.
        </p>
        <p>
          Anda dapat mengelola data mahasiswa dan produk melalui halaman yang
          tersedia.
        </p>

        <div className="actions">
          <Link href="/mahasiswa">
            <button className="btn-primary">Buka Data Mahasiswa</button>
          </Link>

          <Link href="/produk">
            <button className="btn-secondary">Buka Data Produk</button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export function NotFoundPage() {
  return (
    <main className="container">
      <div className="card">
        <h1>404 - Halaman Tidak Ditemukan</h1>
        <p>Maaf, halaman yang Anda cari tidak ditemukan.</p>
        <Link href="/mahasiswa">
          <button className="btn-primary">Buka Data Mahasiswa</button>
        </Link>

        <Link href="/produk">
          <button className="btn-secondary">Buka Data Produk</button>
        </Link>
      </div>
    </main>
  );
}

