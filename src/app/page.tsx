'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/app-shell';
import StatsCards from '@/components/dashboard/stats-cards';
import StatusChart from '@/components/dashboard/status-chart';
import ProgressChart from '@/components/dashboard/progress-chart';
import UpcomingTable from '@/components/dashboard/upcoming-table';
import PageHeader from '@/components/ui/page-header';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import ScoreBadge from '@/components/ui/score-badge';
import { formatDateShort } from '@/lib/utils';
import { ClipboardList, TrendingUp } from 'lucide-react';

function GuruDashboard() {
  const { currentUser } = useAuth();

  const [myObservations, setMyObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadObs() {
      if (!currentUser) return;
      
      const { data } = await supabase
        .from('observations')
        .select(`
          id, subject, class_name, date, nilai, category,
          teachers!inner(name),
          users!inner(name)
        `)
        .eq('teachers.name', currentUser.name)
        .order('date', { ascending: false });
        
      if (data) setMyObservations(data);
      setLoading(false);
    }
    loadObs();
  }, [currentUser]);

  return (
    <>
      <PageHeader
        title="Dashboard Saya"
        description="Lihat hasil supervisi dan jadwal Anda"
      />

      {/* My Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 stagger-children">
        <div className="card card-interactive p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Observasi</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">
                {myObservations.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card card-interactive p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Rata-rata Nilai</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">
                {myObservations.length > 0
                  ? Math.round(
                      myObservations.reduce((a, b) => a + b.nilai, 0) /
                        myObservations.length,
                    )
                  : '-'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* My Observation Results */}
      <div className="card overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="p-5 pb-0">
          <h3 className="text-sm font-semibold text-slate-800">
            Hasil Observasi Saya
          </h3>
        </div>
        {myObservations.length > 0 ? (
          <div className="overflow-x-auto mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Mata Pelajaran</th>
                  <th>Kelas</th>
                  <th>Observer</th>
                  <th>Nilai</th>
                  <th>Kategori</th>
                </tr>
              </thead>
              <tbody>
                {myObservations.map(obs => (
                  <tr key={obs.id}>
                    <td className="whitespace-nowrap font-medium">
                      {formatDateShort(obs.date)}
                    </td>
                    <td>{obs.subject}</td>
                    <td>{obs.class_name}</td>
                    <td>{obs.users?.name}</td>
                    <td className="font-semibold">{obs.nilai}</td>
                    <td>
                      <ScoreBadge category={obs.category} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm">
            Belum ada observasi untuk Anda
          </div>
        )}
      </div>
    </>
  );
}

function ExecutiveDashboard() {
  return (
    <>
      <PageHeader
        title="Executive Dashboard"
        description="Ringkasan supervisi pembelajaran SMK Telkom Malang"
      />
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <StatusChart />
        <ProgressChart />
      </div>
      <div className="mt-6">
        <UpcomingTable />
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { currentUser } = useAuth();

  return (
    <AppShell>
      {currentUser?.role === 'GURU' ? (
        <GuruDashboard />
      ) : (
        <ExecutiveDashboard />
      )}
    </AppShell>
  );
}
