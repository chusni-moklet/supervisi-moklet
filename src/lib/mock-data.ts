import {
  type User,
  type Teacher,
  type IndicatorCategory,
  type Observation,
  type Schedule,
  type DashboardStats,
} from './types';
import { getScoreCategory } from './utils';

// ── Users ────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Chusni Mubarok',
    email: 'chusni@smktelkom-mlg.sch.id',
    role: 'SUPER_ADMIN',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Budi Santoso',
    email: 'budi@smktelkom-mlg.sch.id',
    role: 'KEPALA_SEKOLAH',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Siti Aminah',
    email: 'siti@smktelkom-mlg.sch.id',
    role: 'ADMIN',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Agus Salim',
    email: 'agus@smktelkom-mlg.sch.id',
    role: 'ADMIN',
  },
];

// ── Teachers ─────────────────────────────────────────────
export const MOCK_TEACHERS: Teacher[] = [
  { id: 't11', name: 'Yuni Astuti, S.Pd.', department: 'Hubinkom' },
  { id: 't12', name: 'Fajar Nugroho, S.T.', department: 'Kesiswaan' },
  { id: 't13', name: 'Maya Sari, S.Pd.', department: 'Kurikulum' },
  { id: 't14', name: 'Rizky Aditya, S.Kom.', department: 'QDPM' },
  { id: 't15', name: 'Nita Puspita, S.Pd.', department: 'Sarpra' },
];

// ── Indicators ───────────────────────────────────────────
export const MOCK_INDICATOR_CATEGORIES: IndicatorCategory[] = [
  {
    id: 'cat1',
    name: 'Pembukaan',
    indicators: [
      { id: 'ind1', categoryId: 'cat1', number: 1, text: 'Guru menyampaikan salam dan mengecek kehadiran siswa' },
      { id: 'ind2', categoryId: 'cat1', number: 2, text: 'Guru menyampaikan tujuan pembelajaran yang akan dicapai' },
      { id: 'ind3', categoryId: 'cat1', number: 3, text: 'Guru memberikan apersepsi/motivasi untuk memulai pembelajaran' },
    ],
  },
  {
    id: 'cat2',
    name: 'Inti Pembelajaran',
    indicators: [
      { id: 'ind4', categoryId: 'cat2', number: 4, text: 'Guru menguasai materi pelajaran yang disampaikan' },
      { id: 'ind5', categoryId: 'cat2', number: 5, text: 'Guru menggunakan metode/model pembelajaran yang sesuai' },
      { id: 'ind6', categoryId: 'cat2', number: 6, text: 'Guru menggunakan media/alat pembelajaran yang efektif' },
      { id: 'ind7', categoryId: 'cat2', number: 7, text: 'Guru melibatkan siswa secara aktif dalam proses pembelajaran' },
      { id: 'ind8', categoryId: 'cat2', number: 8, text: 'Guru memberikan umpan balik yang konstruktif kepada siswa' },
    ],
  },
  {
    id: 'cat3',
    name: 'Penutup',
    indicators: [
      { id: 'ind9', categoryId: 'cat3', number: 9, text: 'Guru membimbing siswa menyimpulkan materi pembelajaran' },
      { id: 'ind10', categoryId: 'cat3', number: 10, text: 'Guru memberikan tugas/tindak lanjut dan menyampaikan rencana pembelajaran berikutnya' },
    ],
  },
];

export const ALL_INDICATORS = MOCK_INDICATOR_CATEGORIES.flatMap(c => c.indicators);

// ── Completed Observations ───────────────────────────────
function makeObs(
  id: string,
  observerId: string,
  observerName: string,
  teacherId: string,
  teacherName: string,
  department: string,
  date: string,
  totalScore: number,
): Observation {
  const maxScore = ALL_INDICATORS.length * 2;
  const nilai = Math.round((totalScore / maxScore) * 100);
  return {
    id,
    observerId,
    observerName,
    teacherId,
    teacherName,
    department,
    date,
    scores: [],
    totalScore,
    maxScore,
    nilai,
    category: getScoreCategory(nilai),
    createdAt: date,
  };
}

export const MOCK_OBSERVATIONS: Observation[] = [
  makeObs('obs1', 'u1', 'Chusni Mubarok', 't1', 'Ahmad Fauzi, S.Pd.', 'Hubinkom', '2026-05-10', 18),
  makeObs('obs2', 'u3', 'Siti Rahmawati', 't2', 'Dewi Kartika, S.Pd.', 'Kesiswaan', '2026-05-12', 16),
  makeObs('obs3', 'u1', 'Chusni Mubarok', 't3', 'Rudi Hermawan, S.T.', 'Kurikulum', '2026-05-15', 19),
  makeObs('obs4', 'u3', 'Siti Rahmawati', 't4', 'Rina Fitriani, S.Pd.', 'QDPM', '2026-05-18', 14),
  makeObs('obs5', 'u1', 'Chusni Mubarok', 't5', 'Hendra Wijaya, S.Kom.', 'Sarpra', '2026-05-20', 17),
  makeObs('obs6', 'u3', 'Siti Rahmawati', 't6', 'Bambang Prasetyo, M.T.', 'Tata Usaha', '2026-05-22', 12),
  makeObs('obs7', 'u1', 'Chusni Mubarok', 't7', 'Sri Wahyuni, S.Pd.', 'Hubinkom', '2026-06-01', 15),
  makeObs('obs8', 'u3', 'Siti Rahmawati', 't10', 'Doni Prasetya, S.Kom.', 'Kesiswaan', '2026-06-05', 20),
  makeObs('obs9', 'u1', 'Chusni Mubarok', 't13', 'Maya Sari, S.Pd.', 'Kurikulum', '2026-06-08', 13),
  makeObs('obs10', 'u3', 'Siti Rahmawati', 't8', 'Agus Supriyanto, S.Pd.', 'QDPM', '2026-06-10', 16),
];

// ── Schedules ────────────────────────────────────────────
export const MOCK_SCHEDULES: Schedule[] = [
  { id: 's1', teacherId: 't9', teacherName: 'Lina Marlina, S.Pd.', department: 'Hubinkom', observerId: 'u1', observerName: 'Chusni Mubarok', date: '2026-06-25', status: 'Terjadwal' },
  { id: 's2', teacherId: 't11', teacherName: 'Yuni Astuti, S.Pd.', department: 'Kesiswaan', observerId: 'u3', observerName: 'Siti Rahmawati', date: '2026-06-26', status: 'Terjadwal' },
  { id: 's3', teacherId: 't12', teacherName: 'Fajar Nugroho, S.T.', department: 'Kurikulum', observerId: 'u1', observerName: 'Chusni Mubarok', date: '2026-06-28', status: 'Terjadwal' },
  { id: 's4', teacherId: 't14', teacherName: 'Rizky Aditya, S.Kom.', department: 'QDPM', observerId: 'u3', observerName: 'Siti Rahmawati', date: '2026-07-01', status: 'Terjadwal' },
  { id: 's5', teacherId: 't15', teacherName: 'Nita Puspita, S.Pd.', department: 'Sarpra', observerId: 'u1', observerName: 'Chusni Mubarok', date: '2026-07-03', status: 'Terjadwal' },
  { id: 's6', teacherId: 't1', teacherName: 'Ahmad Fauzi, S.Pd.', department: 'Tata Usaha', observerId: 'u1', observerName: 'Chusni Mubarok', date: '2026-05-10', status: 'Selesai' },
  { id: 's7', teacherId: 't2', teacherName: 'Dewi Kartika, S.Pd.', department: 'Hubinkom', observerId: 'u3', observerName: 'Siti Rahmawati', date: '2026-05-12', status: 'Selesai' },
  { id: 's8', teacherId: 't3', teacherName: 'Rudi Hermawan, S.T.', department: 'Kesiswaan', observerId: 'u1', observerName: 'Chusni Mubarok', date: '2026-05-15', status: 'Selesai' },
];

// ── Dashboard Stats ──────────────────────────────────────
export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalGuru: MOCK_TEACHERS.length,
  sudahSupervisi: MOCK_OBSERVATIONS.length,
  terjadwal: MOCK_SCHEDULES.filter(s => s.status === 'Terjadwal').length,
  belumSupervisi: MOCK_TEACHERS.length - MOCK_OBSERVATIONS.length - MOCK_SCHEDULES.filter(s => s.status === 'Terjadwal').length,
};

// ── Progress by Subject (for bar chart) ──────────────────
export const MOCK_SUBJECT_PROGRESS = [
  { department: 'Hubinkom', avgScore: 78 },
  { department: 'Kesiswaan', avgScore: 80 },
  { department: 'Kurikulum', avgScore: 95 },
  { department: 'QDPM', avgScore: 70 },
  { department: 'Sarpra', avgScore: 85 },
  { department: 'Tata Usaha', avgScore: 60 },
];
