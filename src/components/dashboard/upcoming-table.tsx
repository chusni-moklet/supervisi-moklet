"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { type ScheduleStatus } from "@/lib/types";

const STATUS_STYLES: Record<ScheduleStatus, string> = {
  Terjadwal: "bg-blue-100 text-blue-700",
  Selesai: "bg-emerald-100 text-emerald-700",
  Batal: "bg-red-100 text-red-700",
};

export default function UpcomingTable() {
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSchedules() {
      const { data } = await supabase
        .from("schedules")
        .select(
          `
          id, date, status, department,
          teachers(name)
        `,
        )
        .eq("status", "Terjadwal")
        .order("date", { ascending: true })
        .limit(5);

      if (data) {
        setSchedules(data);
      }
    }
    fetchSchedules();
  }, []);

  return (
    <div
      className="card overflow-hidden animate-fade-in-up"
      style={{ animationDelay: "400ms" }}
    >
      <div className="p-5 pb-0">
        <h3 className="text-sm font-semibold text-slate-800">
          Jadwal Observasi
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Daftar jadwal supervisi yang akan dilaksanakan
        </p>
      </div>
      <div className="overflow-x-auto mt-4">
        <table className="data-table">
          <thead>
            <tr>
              <th>Guru</th>
              <th>Bagian</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-slate-500">
                  Tidak ada jadwal mendatang
                </td>
              </tr>
            ) : (
              schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>
                    <div className="font-medium text-slate-800">
                      {schedule.teachers?.name}
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                      {schedule.department}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center text-tech-blue">
                      <Clock className="w-4 h-4 mr-1.5" />
                      {new Date(schedule.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
