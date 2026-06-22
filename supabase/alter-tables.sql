-- Script untuk migrasi struktur database dari NIP/Mapel/Kelas menjadi Bagian
-- Jalankan ini di SQL Editor Supabase Anda

-- 1. Tabel users
ALTER TABLE public.users 
  DROP COLUMN IF EXISTS nip,
  DROP COLUMN IF EXISTS subject,
  DROP COLUMN IF EXISTS class_name,
  ADD COLUMN IF NOT EXISTS department TEXT;

-- 2. Tabel observations
ALTER TABLE public.observations 
  DROP COLUMN IF EXISTS subject,
  DROP COLUMN IF EXISTS class_name,
  ADD COLUMN IF NOT EXISTS department TEXT;

-- 3. Tabel schedules
ALTER TABLE public.schedules 
  DROP COLUMN IF EXISTS subject,
  DROP COLUMN IF EXISTS class_name,
  ADD COLUMN IF NOT EXISTS department TEXT;
