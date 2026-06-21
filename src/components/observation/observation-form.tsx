'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type ObservationHeaderData,
  observationHeaderSchema,
} from '@/lib/schemas';
import { supabase } from '@/lib/supabase';
import { type ScoreValue, type User, type IndicatorCategory, type Indicator } from '@/lib/types';
import { getScoreCategory, getScoreCategoryColor, cn } from '@/lib/utils';
import PageHeader from '@/components/ui/page-header';
import ScoreBadge from '@/components/ui/score-badge';
import { Save, RotateCcw, CheckCircle } from 'lucide-react';

const SCORE_OPTIONS = [
  { value: 0 as ScoreValue, label: 'TIDAK TERLIHAT', cssClass: 'selected-0' },
  {
    value: 1 as ScoreValue,
    label: 'TERLIHAT tetapi kurang/tidak sesuai',
    cssClass: 'selected-1',
  },
  { value: 2 as ScoreValue, label: 'TERLIHAT dan SESUAI', cssClass: 'selected-2' },
];

export default function ObservationForm() {
  const [scores, setScores] = useState<Record<string, ScoreValue>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Supabase Data States
  const [categories, setCategories] = useState<IndicatorCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [allIndicators, setAllIndicators] = useState<Indicator[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [userRes, catRes, indRes, teachRes] = await Promise.all([
        supabase.from('users').select('*').in('role', ['SUPER_ADMIN', 'ADMIN', 'KEPALA_SEKOLAH']),
        supabase.from('indicator_categories').select('*').order('sort_order'),
        supabase.from('indicators').select('*').order('number'),
        supabase.from('users').select('*').eq('role', 'ADMIN')
      ]);

      if (userRes.data) setUsers(userRes.data as User[]);
      if (teachRes.data) setTeachers(teachRes.data as User[]);
      if (catRes.data && indRes.data) {
        setAllIndicators(indRes.data as Indicator[]);
        const merged = catRes.data.map(cat => ({
          id: cat.id,
          name: cat.name,
          indicators: indRes.data.filter((i: any) => i.category_id === cat.id).map((i: any) => ({
            id: i.id,
            categoryId: i.category_id,
            number: i.number,
            text: i.text
          }))
        }));
        setCategories(merged);
      }
      setIsLoaded(true);
    };
    fetchData();
  }, []);

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ObservationHeaderData>({
    resolver: zodResolver(observationHeaderSchema),
  });

  const selectedTeacherId = watch('teacherId');
  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);

  // Admins and super admins who can observe
  const observers = users;

  // Score calculations
  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((sum: number, val) => sum + val, 0);
  }, [scores]);

  const maxScore = allIndicators.length * 2;
  const answeredCount = Object.keys(scores).length;
  const totalIndicators = allIndicators.length;

  const nilai = useMemo(() => {
    if (answeredCount === 0) return 0;
    return Math.round((totalScore / maxScore) * 100);
  }, [totalScore, maxScore, answeredCount]);

  const category = getScoreCategory(nilai);
  const categoryColor = getScoreCategoryColor(category);

  // Circular progress calculation
  const circumference = 2 * Math.PI * 42;
  const progress = answeredCount > 0 ? (nilai / 100) * circumference : 0;

  const handleScoreChange = useCallback(
    (indicatorId: string, value: ScoreValue) => {
      setScores(prev => ({ ...prev, [indicatorId]: value }));
    },
    [],
  );

  const handleReset = () => {
    setScores({});
    reset();
    setSubmitted(false);
  };

  const onSubmit = async (data: ObservationHeaderData) => {
    if (answeredCount < totalIndicators) return;
    
    // Simpan ke Supabase
    const { data: obsData, error: obsErr } = await supabase
      .from('observations')
      .insert([{
        observer_id: data.observerId,
        teacher_id: data.teacherId,
        subject: selectedTeacher?.subject,
        class_name: selectedTeacher?.class_name,
        date: data.date,
        total_score: totalScore,
        max_score: maxScore,
        nilai: nilai,
        category: category
      }])
      .select();

    if (obsErr) {
      alert(`Error: ${obsErr.message}`);
      return;
    }

    if (obsData && obsData[0]) {
      const obsId = obsData[0].id;
      // Insert scores
      const scoreInserts = Object.entries(scores).map(([indicatorId, value]) => ({
        observation_id: obsId,
        indicator_id: indicatorId,
        value: value
      }));

      const { error: scoreErr } = await supabase.from('observation_scores').insert(scoreInserts);
      if (scoreErr) {
        alert(`Error: ${scoreErr.message}`);
      }
    }

    setSubmitted(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Form Observasi Pembelajaran"
        description="Isi lembar observasi untuk menilai proses pembelajaran"
        actions={
          <button onClick={handleReset} className="btn btn-secondary btn-sm">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* Left: Form Content */}
          <div className="space-y-6">
            {/* Header Section */}
            <div className="card p-5 animate-fade-in-up">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">
                Informasi Observasi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="observer-select"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Observer
                  </label>
                  <select
                    id="observer-select"
                    className="input select"
                    {...register('observerId')}
                  >
                    <option value="">Pilih Observer</option>
                    {observers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  {errors.observerId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.observerId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="teacher-select"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Guru yang Diobservasi
                  </label>
                  <select
                    id="teacher-select"
                    className="input select"
                    {...register('teacherId')}
                  >
                    <option value="">Pilih Guru</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {errors.teacherId && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.teacherId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Mata Pelajaran
                  </label>
                  <input
                    className="input bg-slate-50"
                    value={selectedTeacher?.subject || ''}
                    readOnly
                    placeholder="— Pilih guru terlebih dahulu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Kelas
                  </label>
                  <input
                    className="input bg-slate-50"
                    value={selectedTeacher?.class_name || ''}
                    readOnly
                    placeholder="— Pilih guru terlebih dahulu"
                  />
                </div>

                <div className="sm:col-span-2 sm:max-w-[50%]">
                  <label
                    htmlFor="date-input"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Tanggal Observasi
                  </label>
                  <input
                    id="date-input"
                    type="date"
                    className="input"
                    {...register('date')}
                  />
                  {errors.date && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.date.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Indicator Categories */}
            {!isLoaded ? (
              <div className="card p-8 text-center text-slate-500 animate-pulse">Memuat Form Observasi...</div>
            ) : categories.length === 0 ? (
              <div className="card p-8 text-center text-slate-500">Belum ada aspek indikator di database.</div>
            ) : categories.map((cat, catIdx) => (
              <div
                key={cat.id}
                className="card p-5 animate-fade-in-up"
                style={{ animationDelay: `${(catIdx + 1) * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white text-sm font-bold">
                    {String.fromCharCode(65 + catIdx)}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-800">
                    {cat.name}
                  </h3>
                </div>

                <div className="space-y-4">
                  {cat.indicators.map(indicator => (
                    <div key={indicator.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <p className="text-sm text-slate-700 mb-3">
                        <span className="font-semibold text-tech-blue">
                          {indicator.number}.
                        </span>{' '}
                        {indicator.text}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {SCORE_OPTIONS.map(opt => {
                          const isSelected =
                            scores[indicator.id] === opt.value;
                          return (
                            <label
                              key={opt.value}
                              className={cn(
                                'radio-option',
                                isSelected && opt.cssClass,
                              )}
                            >
                              <input
                                type="radio"
                                name={`score-${indicator.id}`}
                                value={opt.value}
                                checked={isSelected}
                                onChange={() =>
                                  handleScoreChange(indicator.id, opt.value)
                                }
                                disabled={submitted}
                              />
                              <span className="text-xs sm:text-sm font-medium">
                                {opt.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Submit Button (mobile) */}
            <div className="xl:hidden">
              <button
                type="submit"
                disabled={
                  submitted || answeredCount < totalIndicators
                }
                id="btn-submit-observation-mobile"
                className="btn btn-primary w-full"
              >
                <Save className="w-4 h-4" />
                Simpan Observasi
              </button>
              {answeredCount < totalIndicators && (
                <p className="text-xs text-slate-400 text-center mt-2">
                  Jawab semua {totalIndicators} indikator untuk submit (
                  {answeredCount}/{totalIndicators})
                </p>
              )}
            </div>
          </div>

          {/* Right: Score Panel (sticky) */}
          <div className="hidden xl:block">
            <div className="sticky top-20">
              <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <h3 className="text-sm font-semibold text-slate-800 mb-4">
                  Hasil Penilaian
                </h3>

                {/* Circular Progress */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <svg
                      width="120"
                      height="120"
                      className="circular-progress"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="42"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="8"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="42"
                        fill="none"
                        stroke={answeredCount > 0 ? categoryColor : '#e2e8f0'}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-800">
                        {answeredCount > 0 ? nilai : '—'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        NILAI
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Skor Perolehan</span>
                    <span className="font-semibold text-slate-800">
                      {totalScore} / {maxScore}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Indikator Dijawab</span>
                    <span className="font-semibold text-slate-800">
                      {answeredCount} / {totalIndicators}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Kategori</span>
                    {answeredCount > 0 ? (
                      <ScoreBadge category={category} />
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    submitted || answeredCount < totalIndicators
                  }
                  id="btn-submit-observation"
                  className="btn btn-primary w-full mt-5"
                >
                  {submitted ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Tersimpan
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Observasi
                    </>
                  )}
                </button>
                {!submitted && answeredCount < totalIndicators && (
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    Jawab semua indikator untuk submit
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Toast */}
      {showToast && (
        <div className="toast toast-success flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Observasi berhasil disimpan!
        </div>
      )}
    </div>
  );
}
