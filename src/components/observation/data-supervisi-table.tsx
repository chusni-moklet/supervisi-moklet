"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatDateShort } from "@/lib/utils";
import ScoreBadge from "@/components/ui/score-badge";
import PageHeader from "@/components/ui/page-header";
import { Search, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function DataSupervisiTable() {
  const [observations, setObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data supervisi ini?")) return;

    const { error } = await supabase.from("observations").delete().eq("id", id);
    if (!error) {
      setObservations(observations.filter((o) => o.id !== id));
    } else {
      alert("Gagal menghapus data: " + error.message);
    }
  };

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from("observations")
        .select(
          `
          id, department, date, nilai, category,
          teacher:users!observations_teacher_id_fkey(name),
          observer:users!observations_observer_id_fkey(name)
        `,
        )
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching observations:", error);
      }

      if (data) setObservations(data);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredData = observations.filter((obs) => {
    const q = searchQuery.toLowerCase();
    const teacherName = obs.teacher?.name?.toLowerCase() || "";
    const observerName = obs.observer?.name?.toLowerCase() || "";
    const department = obs.department?.toLowerCase() || "";
    return (
      teacherName.includes(q) ||
      observerName.includes(q) ||
      department.includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Data Supervisi"
        description="Daftar hasil supervisi pembelajaran yang telah dilakukan"
      />

      <div className="card p-4 mb-4 animate-fade-in">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="input !pl-10"
            placeholder="Cari guru, observer, atau mata pelajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div
        className="card overflow-hidden animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        {loading ? (
          <div className="p-8 text-center text-slate-500 animate-pulse">
            Memuat data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Guru</th>
                  <th>Mata Pelajaran</th>
                  <th>Observer</th>
                  <th>Nilai</th>
                  <th>Kategori</th>
                  {currentUser?.role === "SUPER_ADMIN" && <th>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((obs) => (
                  <tr key={obs.id}>
                    <td className="whitespace-nowrap font-medium">
                      {formatDateShort(obs.date)}
                    </td>
                    <td className="font-medium">{obs.teacher?.name}</td>
                    <td>{obs.department}</td>
                    <td className="text-slate-500">{obs.observer?.name}</td>
                    <td className="font-semibold">{obs.nilai}</td>
                    <td>
                      <ScoreBadge category={obs.category} />
                    </td>
                    {currentUser?.role === "SUPER_ADMIN" && (
                      <td>
                        <button
                          onClick={() => handleDelete(obs.id)}
                          className="btn btn-ghost p-1.5 text-red-500 hover:bg-red-50"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={currentUser?.role === "SUPER_ADMIN" ? 7 : 6} className="text-center py-8 text-slate-400">
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
