"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { type IndicatorCategory, type Indicator } from "@/lib/types";
import PageHeader from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  GripVertical,
  FolderOpen,
  FileText,
  Save,
} from "lucide-react";

export default function IndicatorManagement() {
  const [categories, setCategories] = useState<IndicatorCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch from Supabase
  const fetchData = async () => {
    const { data: cats } = await supabase
      .from("indicator_categories")
      .select("*")
      .order("created_at");
    const { data: inds } = await supabase
      .from("indicators")
      .select("*")
      .order("number");

    if (cats) {
      const merged: IndicatorCategory[] = cats.map((cat) => ({
        id: cat.id,
        name: cat.name,
        indicators: (inds || [])
          .filter((ind) => ind.category_id === cat.id)
          .map((ind) => ({
            id: ind.id,
            categoryId: ind.category_id,
            number: ind.number,
            text: ind.text,
          })),
      }));
      setCategories(merged);
      setExpandedCats(new Set(cats.map((c) => c.id)));
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Expanded categories
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // Modal states
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<IndicatorCategory | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<IndicatorCategory | null>(null);

  const [showAddIndicator, setShowAddIndicator] = useState<string | null>(null); // categoryId
  const [editingIndicator, setEditingIndicator] = useState<{
    indicator: Indicator;
    categoryId: string;
  } | null>(null);
  const [deletingIndicator, setDeletingIndicator] = useState<{
    indicator: Indicator;
    categoryId: string;
  } | null>(null);

  // Form states
  const [categoryName, setCategoryName] = useState("");
  const [indicatorText, setIndicatorText] = useState("");

  // Toast
  const [showToast, setShowToast] = useState<string | null>(null);

  const toast = useCallback((msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  // ── Category CRUD ──────────────────────────────────────

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;
    const { data, error } = await supabase
      .from("indicator_categories")
      .insert([{ name: categoryName.trim() }])
      .select();

    if (error) {
      toast(`Error: ${error.message}`);
      return;
    }

    if (data && data[0]) {
      const newCat: IndicatorCategory = {
        id: data[0].id,
        name: data[0].name,
        indicators: [],
      };
      setCategories((prev) => [...prev, newCat]);
      setExpandedCats((prev) => new Set([...prev, newCat.id]));
      toast(`Aspek "${newCat.name}" berhasil ditambahkan`);
    }

    setCategoryName("");
    setShowAddCategory(false);
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryName.trim()) return;
    const { error } = await supabase
      .from("indicator_categories")
      .update({ name: categoryName.trim() })
      .eq("id", editingCategory.id);

    if (error) {
      toast(`Error: ${error.message}`);
      return;
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingCategory.id ? { ...c, name: categoryName.trim() } : c,
      ),
    );
    toast(`Aspek berhasil diubah menjadi "${categoryName.trim()}"`);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    const { error } = await supabase
      .from("indicator_categories")
      .delete()
      .eq("id", deletingCategory.id);

    if (error) {
      toast(`Error: ${error.message}`);
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
    toast(`Aspek "${deletingCategory.name}" berhasil dihapus`);
    setDeletingCategory(null);
  };

  // ── Indicator CRUD ─────────────────────────────────────

  const getNextIndicatorNumber = (categoryId: string): number => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat || cat.indicators.length === 0) return 1;
    return Math.max(...cat.indicators.map((i) => i.number)) + 1;
  };

  const handleAddIndicator = async (categoryId: string) => {
    if (!indicatorText.trim()) return;
    const nextNum = getNextIndicatorNumber(categoryId);
    const { data, error } = await supabase
      .from("indicators")
      .insert([
        {
          category_id: categoryId,
          number: nextNum,
          text: indicatorText.trim(),
        },
      ])
      .select();

    if (error) {
      toast(`Error: ${error.message}`);
      return;
    }

    if (data && data[0]) {
      const newIndicator: Indicator = {
        id: data[0].id,
        categoryId: data[0].category_id,
        number: data[0].number,
        text: data[0].text,
      };
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, indicators: [...c.indicators, newIndicator] }
            : c,
        ),
      );
      toast("Indikator berhasil ditambahkan");
    }
    setIndicatorText("");
    setShowAddIndicator(null);
  };

  const handleEditIndicator = async () => {
    if (!editingIndicator || !indicatorText.trim()) return;
    const { indicator, categoryId } = editingIndicator;
    const { error } = await supabase
      .from("indicators")
      .update({ text: indicatorText.trim() })
      .eq("id", indicator.id);

    if (error) {
      toast(`Error: ${error.message}`);
      return;
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              indicators: c.indicators.map((i) =>
                i.id === indicator.id
                  ? { ...i, text: indicatorText.trim() }
                  : i,
              ),
            }
          : c,
      ),
    );
    toast("Indikator berhasil diubah");
    setEditingIndicator(null);
    setIndicatorText("");
  };

  const handleDeleteIndicator = async () => {
    if (!deletingIndicator) return;
    const { indicator, categoryId } = deletingIndicator;
    const { error } = await supabase
      .from("indicators")
      .delete()
      .eq("id", indicator.id);

    if (error) {
      toast(`Error: ${error.message}`);
      return;
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              indicators: c.indicators
                .filter((i) => i.id !== indicator.id)
                .map((i, idx) => ({ ...i, number: idx + 1 })), // re-number locally
            }
          : c,
      ),
    );
    toast("Indikator berhasil dihapus");
    setDeletingIndicator(null);
  };

  // ── Stats ──────────────────────────────────────────────
  const totalIndicators = categories.reduce(
    (sum, c) => sum + c.indicators.length,
    0,
  );

  return (
    <div>
      <PageHeader
        title="Aspek & Indikator"
        description={`Kelola aspek penilaian dan indikator observasi — ${categories.length} aspek, ${totalIndicators} indikator`}
        actions={
          <button
            onClick={() => {
              setCategoryName("");
              setShowAddCategory(true);
            }}
            id="btn-add-category"
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Aspek
          </button>
        }
      />

      {/* Category list */}
      {!isLoaded ? (
        <div className="card p-8 text-center text-slate-500 animate-pulse">
          Memuat data...
        </div>
      ) : (
        <div className="space-y-4">
          {categories.length === 0 && (
            <div className="card p-12 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500">
                Belum ada aspek penilaian. Klik "Tambah Aspek" untuk mulai.
              </p>
            </div>
          )}

          {categories.map((cat, catIdx) => {
            const isExpanded = expandedCats.has(cat.id);

            return (
              <div
                key={cat.id}
                className="card overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${catIdx * 80}ms` }}
              >
                {/* Category Header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50/60 transition-colors select-none"
                  onClick={() => toggleCategory(cat.id)}
                >
                  <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {String.fromCharCode(65 + catIdx)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {cat.indicators.length} indikator
                    </p>
                  </div>

                  {/* Category Actions */}
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setCategoryName(cat.name);
                        setEditingCategory(cat);
                      }}
                      id={`btn-edit-cat-${cat.id}`}
                      className="btn btn-ghost btn-sm text-blue-600 hover:bg-blue-50"
                      title="Edit Aspek"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      id={`btn-delete-cat-${cat.id}`}
                      className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50"
                      title="Hapus Aspek"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </div>

                {/* Expanded Indicators */}
                {isExpanded && (
                  <div className="border-t border-slate-100">
                    {cat.indicators.length === 0 && (
                      <div className="p-6 text-center">
                        <p className="text-xs text-slate-400 mb-3">
                          Belum ada indikator di aspek ini
                        </p>
                        <button
                          onClick={() => {
                            setIndicatorText("");
                            setShowAddIndicator(cat.id);
                          }}
                          className="btn btn-secondary btn-sm text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambah Indikator Pertama
                        </button>
                      </div>
                    )}

                    {cat.indicators.map((indicator, idx) => (
                      <div
                        key={indicator.id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors group",
                          idx < cat.indicators.length - 1 &&
                            "border-b border-slate-50",
                        )}
                      >
                        <GripVertical className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                          {indicator.number}
                        </div>

                        <p className="text-sm text-slate-700 flex-1 pt-0.5 leading-relaxed">
                          {indicator.text}
                        </p>

                        {/* Indicator Actions */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={() => {
                              setIndicatorText(indicator.text);
                              setEditingIndicator({
                                indicator,
                                categoryId: cat.id,
                              });
                            }}
                            id={`btn-edit-ind-${indicator.id}`}
                            className="btn btn-ghost btn-sm text-blue-600 hover:bg-blue-50 p-1.5"
                            title="Edit Indikator"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() =>
                              setDeletingIndicator({
                                indicator,
                                categoryId: cat.id,
                              })
                            }
                            id={`btn-delete-ind-${indicator.id}`}
                            className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 p-1.5"
                            title="Hapus Indikator"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Indicator Button */}
                    {cat.indicators.length > 0 && (
                      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/40">
                        <button
                          onClick={() => {
                            setIndicatorText("");
                            setShowAddIndicator(cat.id);
                          }}
                          id={`btn-add-ind-${cat.id}`}
                          className="btn btn-ghost btn-sm text-xs text-tech-blue hover:bg-blue-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambah Indikator
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Category Modal ───────────────────── */}
      {showAddCategory && (
        <>
          <div className="overlay" onClick={() => setShowAddCategory(false)} />
          <div className="modal" id="modal-add-category">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-tech-blue" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Tambah Aspek Baru
                </h3>
              </div>
              <button
                onClick={() => setShowAddCategory(false)}
                className="btn-ghost p-1 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nama Aspek
              </label>
              <input
                id="input-category-name"
                className="input"
                placeholder="Contoh: Pembukaan, Inti Pembelajaran, Penutup"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                autoFocus
              />
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowAddCategory(false)}
                className="btn btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={handleAddCategory}
                id="btn-confirm-add-cat"
                className="btn btn-primary flex-1"
                disabled={!categoryName.trim()}
              >
                <Plus className="w-4 h-4" />
                Tambah
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Edit Category Modal ──────────────────── */}
      {editingCategory && (
        <>
          <div className="overlay" onClick={() => setEditingCategory(null)} />
          <div className="modal" id="modal-edit-category">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-tech-blue" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Edit Aspek
                </h3>
              </div>
              <button
                onClick={() => setEditingCategory(null)}
                className="btn-ghost p-1 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nama Aspek
              </label>
              <input
                id="input-edit-category-name"
                className="input"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEditCategory()}
                autoFocus
              />
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEditingCategory(null)}
                className="btn btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={handleEditCategory}
                id="btn-confirm-edit-cat"
                className="btn btn-primary flex-1"
                disabled={!categoryName.trim()}
              >
                <Save className="w-4 h-4" />
                Simpan
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Category Modal ────────────────── */}
      {deletingCategory && (
        <>
          <div className="overlay" onClick={() => setDeletingCategory(null)} />
          <div className="modal" id="modal-delete-category">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Hapus Aspek
                </h3>
                <p className="text-sm text-slate-500">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-2">
              Apakah Anda yakin ingin menghapus aspek{" "}
              <span className="font-semibold">
                &quot;{deletingCategory.name}&quot;
              </span>
              ?
            </p>
            {deletingCategory.indicators.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 mb-4">
                <strong>Peringatan:</strong> Aspek ini memiliki{" "}
                {deletingCategory.indicators.length} indikator yang juga akan
                ikut terhapus.
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingCategory(null)}
                className="btn btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteCategory}
                id="btn-confirm-delete-cat"
                className="btn btn-danger flex-1"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Add Indicator Modal ──────────────────── */}
      {showAddIndicator && (
        <>
          <div className="overlay" onClick={() => setShowAddIndicator(null)} />
          <div className="modal" id="modal-add-indicator">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Tambah Indikator
                  </h3>
                  <p className="text-xs text-slate-400">
                    ke aspek &quot;
                    {categories.find((c) => c.id === showAddIndicator)?.name}
                    &quot;
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddIndicator(null)}
                className="btn-ghost p-1 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Deskripsi Indikator
              </label>
              <textarea
                id="input-indicator-text"
                className="input min-h-[80px] resize-y"
                placeholder="Contoh: Guru menyampaikan salam dan mengecek kehadiran siswa"
                value={indicatorText}
                onChange={(e) => setIndicatorText(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowAddIndicator(null)}
                className="btn btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={() => handleAddIndicator(showAddIndicator)}
                id="btn-confirm-add-ind"
                className="btn btn-primary flex-1"
                disabled={!indicatorText.trim()}
              >
                <Plus className="w-4 h-4" />
                Tambah
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Edit Indicator Modal ─────────────────── */}
      {editingIndicator && (
        <>
          <div className="overlay" onClick={() => setEditingIndicator(null)} />
          <div className="modal" id="modal-edit-indicator">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-tech-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Edit Indikator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Indikator #{editingIndicator.indicator.number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingIndicator(null)}
                className="btn-ghost p-1 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Deskripsi Indikator
              </label>
              <textarea
                id="input-edit-indicator-text"
                className="input min-h-[80px] resize-y"
                value={indicatorText}
                onChange={(e) => setIndicatorText(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEditingIndicator(null)}
                className="btn btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={handleEditIndicator}
                id="btn-confirm-edit-ind"
                className="btn btn-primary flex-1"
                disabled={!indicatorText.trim()}
              >
                <Save className="w-4 h-4" />
                Simpan
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Indicator Modal ───────────────── */}
      {deletingIndicator && (
        <>
          <div className="overlay" onClick={() => setDeletingIndicator(null)} />
          <div className="modal" id="modal-delete-indicator">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Hapus Indikator
                </h3>
                <p className="text-sm text-slate-500">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600 mb-5">
              <span className="font-semibold text-tech-blue">
                #{deletingIndicator.indicator.number}.
              </span>{" "}
              {deletingIndicator.indicator.text}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingIndicator(null)}
                className="btn btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteIndicator}
                id="btn-confirm-delete-ind"
                className="btn btn-danger flex-1"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Toast ────────────────────────────────── */}
      {showToast && (
        <div className="toast toast-success flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {showToast}
        </div>
      )}
    </div>
  );
}
