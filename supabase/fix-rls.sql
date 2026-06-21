-- =========================================
-- Fix Row Level Security (RLS) untuk Prototype
-- Eksekusi file ini di SQL Editor Supabase Anda
-- =========================================

-- Supabase secara default memblokir akses tulis (Insert/Update/Delete) dari sisi klien
-- jika Row-Level Security (RLS) aktif namun tidak ada *Policy* yang diatur.
-- Karena aplikasi ini masih berupa prototype (menggunakan login statis tanpa Supabase Auth penuh),
-- kita perlu mematikan sementara RLS agar operasi CRUD bisa berjalan lancar.

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicator_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicators DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules DISABLE ROW LEVEL SECURITY;

-- Jika suatu saat Anda ingin menggunakan RLS, Anda bisa menyalakannya kembali dengan:
-- ALTER TABLE public.nama_tabel ENABLE ROW LEVEL SECURITY;
