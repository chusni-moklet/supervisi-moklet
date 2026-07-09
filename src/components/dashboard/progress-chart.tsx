"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase } from "@/lib/supabase";

function getBarColor(score: number) {
  if (score >= 90) return "#16A34A";
  if (score >= 80) return "#2563EB";
  if (score >= 70) return "#EAB308";
  return "#DC2626";
}

export default function ProgressChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: obs } = await supabase
        .from("observations")
        .select("department, nilai");
      if (obs && obs.length > 0) {
        const deptMap: Record<string, { total: number; count: number }> = {};
        obs.forEach((o) => {
          if (!deptMap[o.department]) {
            deptMap[o.department] = { total: 0, count: 0 };
          }
          deptMap[o.department].total += Number(o.nilai);
          deptMap[o.department].count += 1;
        });

        const chartData = Object.entries(deptMap).map(
          ([department, stats]) => ({
            department:
              department.length > 15
                ? department.substring(0, 15) + "..."
                : department,
            avgScore: Math.round(stats.total / stats.count),
            fullDepartment: department,
          }),
        );

        // Sort by score
        chartData.sort((a, b) => b.avgScore - a.avgScore);
        setData(chartData.slice(0, 8)); // Top 8
      }
    }
    loadData();
  }, []);

  return (
    <div
      className="card p-5 animate-fade-in-up"
      style={{ animationDelay: "300ms" }}
    >
      <h3 className="text-sm font-semibold text-slate-800 mb-4">
        Rata-rata Nilai per Departemen
      </h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="department"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              dy={10}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullDepartment;
                }
                return label;
              }}
              formatter={(value: any) => [`${value}`, "Rata-rata Nilai"]}
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
