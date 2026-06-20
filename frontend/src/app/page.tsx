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

        <Link href="/mahasiswa">
          <button className="btn-primary">Buka Data Mahasiswa</button>
        </Link>
      </div>
    </main>
  );
}
