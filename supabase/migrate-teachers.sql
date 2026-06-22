-- =========================================
-- Migrasi: Menggabungkan Teachers ke Users
-- Jalankan script ini di SQL Editor Supabase
-- =========================================

-- 1. Tambahkan kolom baru ke tabel users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS department TEXT;

-- 2. Migrasikan data dari tabel teachers ke tabel users
-- Kita gunakan NIP sebagai prefix email sementara (nip@smktelkom-mlg.sch.id)
INSERT INTO public.users (id, name, email, role, department)
SELECT 
  id, 
  name, 
  CONCAT(LOWER(REPLACE(name, ' ', '.')), '@smktelkom-mlg.sch.id'), 
  'ADMIN', 
  'Tata Usaha'
FROM public.teachers
ON CONFLICT (email) DO NOTHING;

-- 3. Ubah Foreign Key di tabel observations dan schedules
-- Hapus relasi lama yang mengarah ke tabel teachers
ALTER TABLE public.observations DROP CONSTRAINT IF EXISTS observations_teacher_id_fkey;
ALTER TABLE public.schedules DROP CONSTRAINT IF EXISTS schedules_teacher_id_fkey;

-- Buat relasi baru yang mengarah ke tabel users
ALTER TABLE public.observations 
  ADD CONSTRAINT observations_teacher_id_fkey 
  FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.schedules 
  ADD CONSTRAINT schedules_teacher_id_fkey 
  FOREIGN KEY (teacher_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Update observations and schedules to use department instead of subject and class_name
ALTER TABLE public.observations 
  DROP COLUMN IF EXISTS subject, 
  DROP COLUMN IF EXISTS class_name, 
  ADD COLUMN IF NOT EXISTS department TEXT;

ALTER TABLE public.schedules 
  DROP COLUMN IF EXISTS subject, 
  DROP COLUMN IF EXISTS class_name, 
  ADD COLUMN IF NOT EXISTS department TEXT;

-- 4. Hapus tabel teachers karena sudah tidak digunakan lagi
DROP TABLE IF EXISTS public.teachers CASCADE;
