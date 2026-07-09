"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  gradient: string;
  iconBg: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  iconBg,
}: StatCardProps) {
  return (
    <div className="card card-interactive p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${gradient}`} />
        </div>
      </div>
    </div>
  );
}

export default function StatsCards() {
  const [stats, setStats] = useState({
    totalGuru: 0,
    sudahSupervisi: 0,
    belumSupervisi: 0,
    terjadwal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [usersRes, scheduledRes, completedRes] = await Promise.all([
        supabase
          .from("users")
          .select("id", { count: "exact", head: true })
          .eq("role", "ADMIN"),
        supabase
          .from("schedules")
          .select("id", { count: "exact", head: true })
          .eq("status", "Terjadwal"),
        supabase
          .from("observations")
          .select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalGuru: usersRes.count || 0,
        sudahSupervisi: completedRes.count || 0,
        terjadwal: scheduledRes.count || 0,
        belumSupervisi: Math.max(
          0,
          (usersRes.count || 0) -
            (completedRes.count || 0) -
            (scheduledRes.count || 0),
        ),
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
      <StatCard
        icon={Users}
        label="Total Guru"
        value={loading ? "-" : stats.totalGuru}
        gradient="text-blue-600"
        iconBg="bg-blue-50"
      />
      <StatCard
        icon={CheckCircle}
        label="Sudah Supervisi"
        value={loading ? "-" : stats.sudahSupervisi}
        gradient="text-emerald-600"
        iconBg="bg-emerald-50"
      />
      <StatCard
        icon={Calendar}
        label="Terjadwal"
        value={loading ? "-" : stats.terjadwal}
        gradient="text-amber-600"
        iconBg="bg-amber-50"
      />
      <StatCard
        icon={AlertCircle}
        label="Belum Supervisi"
        value={stats.belumSupervisi}
        gradient="text-red-600"
        iconBg="bg-red-50"
      />
    </div>
  );
}
