import MahasiswaTable from "@/src/components/MahasiswaTable";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">CRUD Mahasiswa</h1>
          <p className="mt-2 text-sm text-slate-600">
            Kelola data mahasiswa, upload foto, pencarian, filter prodi, dan pagination.
          </p>
        </div>
        <MahasiswaTable />
      </div>
    </main>
  );
}
