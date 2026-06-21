'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export default function StatusChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      const [usersRes, scheduledRes, completedRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'ADMIN'),
        supabase.from('schedules').select('id', { count: 'exact', head: true }).eq('status', 'Terjadwal'),
        supabase.from('observations').select('id', { count: 'exact', head: true }),
      ]);
      
      const totalGuru = usersRes.count || 0;
      const sudah = completedRes.count || 0;
      const terjadwal = scheduledRes.count || 0;
      const belum = Math.max(0, totalGuru - sudah - terjadwal);

      setData([
        { name: 'Sudah Supervisi', value: sudah },
        { name: 'Terjadwal', value: terjadwal },
        { name: 'Belum Supervisi', value: belum },
      ]);
    }
    loadStats();
  }, []);

  const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <h3 className="text-sm font-semibold text-slate-800 mb-4">
        Status Supervisi
      </h3>
      <div className="h-[280px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '13px',
              }}
              formatter={(value: any) => [`${value} guru`, '']}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-2xl font-bold text-slate-800">{total}</p>
          <p className="text-[11px] text-slate-400 font-medium">Total Guru</p>
        </div>
      </div>
    </div>
  );
}
