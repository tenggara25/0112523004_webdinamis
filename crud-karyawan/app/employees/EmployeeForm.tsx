'use client';

import { useState } from 'react';
import { createEmployee } from './actions';

// Tipe data dari props (dikirim dari Server Component)
type Department = { id: number; name: string };
type Position   = { id: number; name: string; departmentId: number };
type Skill      = { id: number; name: string };

type Props = {
  departments: Department[];
  positions:   Position[];
  skills:      Skill[];
};

export default function EmployeeForm({ departments, positions, skills }: Props) {
  // State untuk cascading dropdown
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  // Filter position berdasarkan department yang dipilih
  const filteredPositions = positions.filter(
    (p) => p.departmentId === parseInt(selectedDeptId)
  );

  return (
    <form
      action={createEmployee}
      method="post"
      encType="multipart/form-data"
      className="bg-white p-6 rounded-lg shadow space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800">Tambah Karyawan</h2>

      {/* ── TEXT INPUT: Nama ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder="Contoh: Budi Santoso"
          className="w-full border border-black-500 rounded-md px-3 py-2 text-sm text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
      </div>

      {/* ── EMAIL INPUT ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="budi@email.com"
          className="w-full border border-black-500 rounded-md px-3 py-2 text-sm text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ── RADIO BUTTON: Jenis Kelamin ── */}
      <div>
        <label className="block text-sm font-medium text-blue-700 mb-2">
          Jenis Kelamin
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="gender" value="male" required />
            <span className="text-sm text-blue-700">
              Laki-laki
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="gender" value="female" />
            <span className="text-sm text-blue-700">Perempuan</span>
          </label>
        </div>
      </div>

      {/* ── DROPDOWN BIASA: Status ── */}
      <div>
        <label className="block text-sm font-medium text-blue-700 mb-1">
          Status Karyawan
        </label>
        <select
          name="status"
          required
          className="w-full border border-black-500 rounded-md px-3 py-2 text-sm text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Pilih Status --</option>
          <option value="active">Aktif</option>
          <option value="probation">Masa Percobaan</option>
          <option value="inactive">Tidak Aktif</option>
        </select>
      </div>

      {/* ── CASCADING DROPDOWN: Department → Position ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Dropdown 1: Department */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Departemen
          </label>
          <select
            name="departmentId"
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="w-full border border-black-500 rounded-md px-3 py-2 text-sm text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Pilih Departemen --</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Position (isi berubah otomatis) */}
        <div>
          <label className="block text-sm font-medium text-blue-700 mb-1">
            Jabatan
          </label>
          <select
            name="positionId"
            required
            disabled={!selectedDeptId}
            className="w-full border border-black-500 rounded-md px-3 py-2 text-sm text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {selectedDeptId ? '-- Pilih Jabatan --' : '(Pilih departemen dulu)'}
            </option>
            {filteredPositions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── CHECKBOX: Skill (Many-to-Many) ── */}
      <div>
        <label className="block text-sm font-medium text-blue-700 mb-2">
          Skill (boleh pilih lebih dari satu)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {skills.map((skill) => (
            <label key={skill.id} className="flex items-center gap-2 cursor-pointer" >
              <input
                type="checkbox"
                name="skills"
                value={skill.id}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-blue-700 font-medium">
                {skill.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* ── FILE INPUT: Upload Foto ── */}
      <div>
        <label className="block text-sm font-medium text-blue-700 mb-1">
          Foto Profil
        </label>
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="w-full text-sm text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, WEBP. Maks 2MB.</p>
      </div>

      {/* ── TOMBOL SUBMIT ── */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Simpan Karyawan
      </button>
    </form>
  );
}

