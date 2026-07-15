"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ScoreBadge from "@/components/ui/score-badge";
import { getScoreCategory } from "@/lib/utils";

export default function ProgressChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: obs, error } = await supabase
        .from("observations")
        .select(`
          id,
          nilai,
          teacher_id,
          department,
          teacher:users!observations_teacher_id_fkey(name)
        `);
        
      if (error) {
        console.error("Error fetching top scores:", error);
      }

      if (obs && obs.length > 0) {
        const teacherScores = new Map<string, any>();
        
        obs.forEach((o) => {
          const tId = o.teacher_id || 'unknown';
          const currentMax = teacherScores.get(tId)?.score || -1;
          const teacherObj: any = Array.isArray(o.teacher) ? o.teacher[0] : o.teacher;
          
          if (o.nilai > currentMax) {
             teacherScores.set(tId, {
               id: tId,
               name: teacherObj?.name || "Unknown",
               score: o.nilai,
               department: o.department,
             });
          }
        });

        const sortedTop = Array.from(teacherScores.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        setData(sortedTop);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="card p-5 animate-fade-in-up flex flex-col h-full" style={{ animationDelay: "300ms" }}>
      <h3 className="text-sm font-semibold text-slate-800 mb-4">
        10 Nilai Terbaik
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[280px]">
        {loading ? (
          <div className="text-center text-sm text-slate-400 py-8 animate-pulse">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-8">Belum ada data observasi.</div>
        ) : (
          <div className="space-y-3">
            {data.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? 'bg-amber-100 text-amber-600' : 
                    idx === 1 ? 'bg-slate-200 text-slate-600' :
                    idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-tech-blue'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.department}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-lg font-bold text-slate-800">{item.score}</span>
                  <ScoreBadge category={getScoreCategory(item.score)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
