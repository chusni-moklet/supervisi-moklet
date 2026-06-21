'use client';

import AppShell from '@/components/layout/app-shell';
import IndicatorManagement from '@/components/indicators/indicator-management';
import { useAuth } from '@/lib/auth-context';
import { ShieldAlert } from 'lucide-react';

export default function AspekIndikatorPage() {
  const { hasPermission } = useAuth();

  if (!hasPermission('manage_indicators')) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">
            Akses Ditolak
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <IndicatorManagement />
    </AppShell>
  );
}
