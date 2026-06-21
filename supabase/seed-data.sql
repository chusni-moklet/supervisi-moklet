-- =========================================
-- Data Seed untuk Supabase (Dummy Data)
-- Eksekusi file ini di SQL Editor Supabase Anda
-- =========================================

-- 1. Insert Users (Observer/Admin/Super Admin)
INSERT INTO public.users (name, email, role) VALUES
('Chusni Mubarok', 'chusni@smktelkom-mlg.sch.id', 'SUPER_ADMIN'),
('Budi Santoso', 'budi@smktelkom-mlg.sch.id', 'KEPALA_SEKOLAH'),
('Siti Aminah', 'siti@smktelkom-mlg.sch.id', 'ADMIN'),
('Agus Salim', 'agus@smktelkom-mlg.sch.id', 'GURU')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Teachers (Guru yang diobservasi)
INSERT INTO public.teachers (name, nip, subject, class_name) VALUES
('Agus Salim, S.Kom', '198001012005011001', 'Pemrograman Web', 'XI RPL 1'),
('Dewi Lestari, M.Pd', '198203122008012003', 'Matematika', 'X TKJ 2'),
('Eko Prasetyo, S.T', '197905202006041005', 'Jaringan Dasar', 'X TKJ 1'),
('Yuni Astuti, S.Pd.', '199303152016012011', 'Kimia', 'X TKJ 2'),
('Fajar Nugroho, S.T.', '198802102012011012', 'Desain Grafis', 'XI MM 1')
ON CONFLICT (nip) DO NOTHING;

-- 3. Insert Indicator Categories
INSERT INTO public.indicator_categories (name, sort_order) VALUES
('Pembukaan', 1),
('Inti Pembelajaran', 2),
('Penutup', 3);

-- 4. Insert Indicators
INSERT INTO public.indicators (category_id, number, text) VALUES
((SELECT id FROM public.indicator_categories WHERE name = 'Pembukaan' LIMIT 1), 1, 'Guru menyampaikan salam dan mengecek kehadiran siswa'),
((SELECT id FROM public.indicator_categories WHERE name = 'Pembukaan' LIMIT 1), 2, 'Guru menyampaikan tujuan pembelajaran yang akan dicapai'),
((SELECT id FROM public.indicator_categories WHERE name = 'Pembukaan' LIMIT 1), 3, 'Guru memberikan apersepsi/motivasi untuk memulai pembelajaran'),

((SELECT id FROM public.indicator_categories WHERE name = 'Inti Pembelajaran' LIMIT 1), 4, 'Guru menguasai materi pelajaran yang disampaikan'),
((SELECT id FROM public.indicator_categories WHERE name = 'Inti Pembelajaran' LIMIT 1), 5, 'Guru menggunakan metode/model pembelajaran yang sesuai'),
((SELECT id FROM public.indicator_categories WHERE name = 'Inti Pembelajaran' LIMIT 1), 6, 'Guru menggunakan media/alat pembelajaran yang efektif'),
((SELECT id FROM public.indicator_categories WHERE name = 'Inti Pembelajaran' LIMIT 1), 7, 'Guru melibatkan siswa secara aktif dalam proses pembelajaran'),
((SELECT id FROM public.indicator_categories WHERE name = 'Inti Pembelajaran' LIMIT 1), 8, 'Guru memberikan umpan balik yang konstruktif kepada siswa'),

((SELECT id FROM public.indicator_categories WHERE name = 'Penutup' LIMIT 1), 9, 'Guru membimbing siswa menyimpulkan materi pembelajaran'),
((SELECT id FROM public.indicator_categories WHERE name = 'Penutup' LIMIT 1), 10, 'Guru memberikan tugas/tindak lanjut dan menyampaikan rencana pembelajaran berikutnya');
