import { type ScoreCategory } from './types';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getScoreCategory(nilai: number): ScoreCategory {
  if (nilai >= 90) return 'Sangat Baik';
  if (nilai >= 80) return 'Baik';
  if (nilai >= 70) return 'Cukup';
  return 'Kurang';
}

export function getScoreCategoryColor(category: ScoreCategory): string {
  switch (category) {
    case 'Sangat Baik':
      return '#16A34A';
    case 'Baik':
      return '#2563EB';
    case 'Cukup':
      return '#EAB308';
    case 'Kurang':
      return '#DC2626';
  }
}

export function getScoreCategoryBg(category: ScoreCategory): string {
  switch (category) {
    case 'Sangat Baik':
      return 'bg-emerald-100 text-emerald-800';
    case 'Baik':
      return 'bg-blue-100 text-blue-800';
    case 'Cukup':
      return 'bg-yellow-100 text-yellow-800';
    case 'Kurang':
      return 'bg-red-100 text-red-800';
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
