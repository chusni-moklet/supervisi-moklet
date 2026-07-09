-- =========================================
-- Supervisi Moklet - Database Schema
-- Reference SQL (not connected in prototype)
-- =========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Role Enum ─────────────────────────────
CREATE TYPE user_role AS ENUM (
  'SUPER_ADMIN',
  'KEPALA_SEKOLAH',
  'ADMIN',
  'GURU'
);

-- ── Users Table ───────────────────────────
CREATE TABLE public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'ADMIN',
  department TEXT,
  mapel TEXT,
  kelas TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Teachers Table ────────────────────────
CREATE TABLE public.teachers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  name TEXT NOT NULL,
  nip TEXT UNIQUE,
  subject TEXT NOT NULL,
  class_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indicator Categories ──────────────────
CREATE TABLE public.indicator_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indicators ────────────────────────────
CREATE TABLE public.indicators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.indicator_categories(id) ON DELETE CASCADE,
  number INT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Observations ──────────────────────────
CREATE TABLE public.observations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  observer_id UUID REFERENCES public.users(id),
  teacher_id UUID REFERENCES public.teachers(id),
  department TEXT NOT NULL,
  date DATE NOT NULL,
  total_score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 0,
  nilai NUMERIC(5, 2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'Kurang',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Observation Scores ────────────────────
CREATE TABLE public.observation_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  observation_id UUID REFERENCES public.observations(id) ON DELETE CASCADE,
  indicator_id UUID REFERENCES public.indicators(id),
  value INT NOT NULL CHECK (value IN (0, 1, 2)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Schedules ─────────────────────────────
CREATE TABLE public.schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES public.teachers(id),
  observer_id UUID REFERENCES public.users(id),
  department TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Terjadwal' CHECK (status IN ('Terjadwal', 'Selesai', 'Batal')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────
CREATE INDEX idx_observations_teacher ON public.observations(teacher_id);
CREATE INDEX idx_observations_observer ON public.observations(observer_id);
CREATE INDEX idx_observations_date ON public.observations(date);
CREATE INDEX idx_schedules_date ON public.schedules(date);
CREATE INDEX idx_schedules_status ON public.schedules(status);

-- ── Default Super Admin Seed ──────────────
-- NOTE: In production, create via Supabase Auth API
-- Email: chusni@smktelkom-mlg.sch.id
-- Password: chusnimoklet88

INSERT INTO public.users (name, email, role) VALUES
  ('Chusni Mubarok', 'chusni@smktelkom-mlg.sch.id', 'SUPER_ADMIN');

-- ── RLS Policies (commented for reference) ──
/*
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Super Admin can do everything
CREATE POLICY "super_admin_all" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- Guru can only view their own data
CREATE POLICY "guru_read_own" ON public.observations
  FOR SELECT USING (
    teacher_id IN (
      SELECT t.id FROM public.teachers t
      JOIN public.users u ON t.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );
*/
