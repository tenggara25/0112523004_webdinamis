'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import path from 'path';

// ───────────────────────────────────────────
// ACTION: Tambah Karyawan Baru
// ───────────────────────────────────────────
export async function createEmployee(formData: FormData) {
  // 1. Ambil semua field dari form
  const name       = formData.get('name') as string;
  const email      = formData.get('email') as string;
  const gender     = formData.get('gender') as string;       // Radio button
  const status     = formData.get('status') as string;       // Dropdown biasa
  const positionId = parseInt(formData.get('positionId') as string); // Cascading dropdown
  const skillIds   = formData.getAll('skills') as string[];  // Checkbox (array)
  const photo      = formData.get('photo') as File;

  // 2. Handle upload foto
  let photoPath: string | null = null;
  if (photo && photo.size > 0) {
    const bytes    = await photo.arrayBuffer();
    const buffer   = Buffer.from(bytes);
    const filename = `${Date.now()}-${photo.name.replace(/\s/g, '_')}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    await writeFile(filepath, buffer);
    photoPath = `/uploads/${filename}`;
  }

  // 3. Simpan ke database
  await prisma.employee.create({
    data: {
      name,
      email,
      gender,
      status,
      positionId,
      photoPath,
      // Hubungkan Many-to-Many dengan Skill
      skills: {
        connect: skillIds.map((id) => ({ id: parseInt(id) })),
      },
    },
  });

  revalidatePath('/employees');
}

// ───────────────────────────────────────────
// ACTION: Hapus Karyawan
// ───────────────────────────────────────────
export async function deleteEmployee(id: number) {
  await prisma.employee.delete({ where: { id } });
  revalidatePath('/employees');
}

