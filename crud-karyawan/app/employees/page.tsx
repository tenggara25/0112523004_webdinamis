import { prisma } from '@/lib/prisma';
import EmployeeForm from './EmployeeForm';
import { deleteEmployee } from './actions';
import Image from 'next/image';

export default async function EmployeesPage() {
  // Ambil semua data master untuk form
  const departments = await prisma.department.findMany();
  const positions   = await prisma.position.findMany();
  const skills      = await prisma.skill.findMany();

  // Ambil semua karyawan + relasi bertingkat
  const employees = await prisma.employee.findMany({
    include: {
      skills: true,         // Many-to-Many: skill-skill karyawan
      position: {           // One-to-Many: jabatan karyawan
        include: {
          department: true, // One-to-Many: departemen dari jabatan
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Manajemen Karyawan</h1>

      {/* ── FORM ── */}
      <EmployeeForm
        departments={departments}
        positions={positions}
        skills={skills}
      />

      {/* ── TABEL DATA ── */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Data Karyawan ({employees.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Foto</th>
                <th className="px-4 py-3 text-left">Nama & Email</th>
                <th className="px-4 py-3 text-left">Gender</th>
                <th className="px-4 py-3 text-left">Jabatan & Dept.</th>
                <th className="px-4 py-3 text-left">Skill</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Belum ada data. Tambahkan karyawan pertama!
                  </td>
                </tr>
              )}
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  {/* Foto */}
                  <td className="px-4 py-3">
                    {emp.photoPath ? (
                      <Image
                        src={emp.photoPath}
                        alt={emp.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                        N/A
                      </div>
                    )}
                  </td>

                  {/* Nama & Email */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{emp.name}</p>
                    <p className="text-gray-400 text-xs">{emp.email}</p>
                  </td>

                  {/* Gender (dari Radio Button) */}
                  <td className="px-4 py-3 text-gray-600 capitalize">
                    {emp.gender === 'male' ? '👨 Laki-laki' : '👩 Perempuan'}
                  </td>

                  {/* Jabatan & Departemen (Cascading Dropdown) */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-700">{emp.position.name}</p>
                    <p className="text-gray-400 text-xs">{emp.position.department.name}</p>
                  </td>

                  {/* Skill (dari Checkbox / Many-to-Many) */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {emp.skills.length === 0 && (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                      {emp.skills.map((s) => (
                        <span
                          key={s.id}
                          className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status (dari Dropdown biasa) */}
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      emp.status === 'active'    ? 'bg-green-100 text-green-700'  :
                      emp.status === 'probation' ? 'bg-yellow-100 text-yellow-700' :
                                                   'bg-gray-100 text-gray-500'
                    }`}>
                      {emp.status === 'active'    ? 'Aktif'            :
                       emp.status === 'probation' ? 'Masa Percobaan'   : 'Tidak Aktif'}
                    </span>
                  </td>

                  {/* Aksi: Hapus */}
                  <td className="px-4 py-3">
                    <form
                      action={async () => {
                        'use server';
                        await deleteEmployee(emp.id);
                      }}
                    >
                      <button
                        type="submit"
                        onClick={(e) => {
                          if (!confirm(`Hapus karyawan "${emp.name}"?`)) e.preventDefault();
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Hapus
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

