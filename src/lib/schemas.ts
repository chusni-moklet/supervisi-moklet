import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const observationHeaderSchema = z.object({
  observerId: z.string().min(1, 'Pilih observer'),
  teacherId: z.string().min(1, 'Pilih guru'),
  date: z.string().min(1, 'Pilih tanggal'),
});

export type ObservationHeaderData = z.infer<typeof observationHeaderSchema>;

export const userFormSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  role: z.enum(['SUPER_ADMIN', 'KEPALA_SEKOLAH', 'ADMIN', 'GURU'], {
    message: 'Pilih role',
  }),
  nip: z.string().optional(),
  subject: z.string().optional(),
  class_name: z.string().optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;
