'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { supabase } from '@/lib/supabase';

function getBarColor(score: number) {
  if (score >= 90) return '#16A34A';
  if (score >= 80) return '#2563EB';
  if (score >= 70) return '#EAB308';
  return '#DC2626';
}

export default function ProgressChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: obs } = await supabase.from('observations').select('subject, nilai');
      if (obs && obs.length > 0) {
        const subjectMap: Record<string, { total: number; count: number }> = {};
        for (const o of obs) {
          if (!subjectMap[o.subject]) {
            subjectMap[o.subject] = { total: 0, count: 0 };
          }
          subjectMap[o.subject].total += Number(o.nilai);
          subjectMap[o.subject].count += 1;
        }
        
        const chartData = Object.entries(subjectMap).map(([subject, stats]) => ({
          subject: subject.length > 10 ? subject.substring(0, 10) + '...' : subject,
          avgScore: Math.round(stats.total / stats.count),
          fullSubject: subject
        }));
        
        // Sort by score
        chartData.sort((a, b) => b.avgScore - a.avgScore);
        setData(chartData.slice(0, 8)); // Top 8
      }
    }
    loadData();
  }, []);

  return (
    <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <h3 className="text-sm font-semibold text-slate-800 mb-4">
        Rata-rata Nilai per Mata Pelajaran
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              angle={-25}
              textAnchor="end"
              height={60}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '13px',
              }}
              formatter={(value: any) => [`${value}`, 'Rata-rata Nilai']}
              cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
            />
            <Bar dataKey="avgScore" radius={[6, 6, 0, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={getBarColor(entry.avgScore)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
