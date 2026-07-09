"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
  const { loginWithEmail, registerWithEmail, isAuthenticated, authError, isInitializing } =
    useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // If already logged in, redirect
    if (isAuthenticated && !isInitializing) {
      router.replace("/");
    }
  }, [isAuthenticated, isInitializing, router]);

  if (isAuthenticated || isInitializing) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (isRegistering) {
      await registerWithEmail(email, password);
    } else {
      await loginWithEmail(email, password);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-red-100/30 blur-3xl" />
      </div>

      <div className="w-full max-w-[420px] animate-fade-in-up relative">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-red shadow-lg mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Supervisi Moklet
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lembar Observasi Pembelajaran
          </p>
          <p className="text-xs text-slate-400 mt-0.5">SMK Telkom Malang</p>
        </div>

        {/* Login Card */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-1 text-center">
            {isRegistering ? "Daftar Akun" : "Masuk ke Akun"}
          </h2>
          <p className="text-sm text-slate-400 mb-6 text-center">
            Gunakan email @smktelkom-mlg.sch.id Anda
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error / Success Message */}
            {authError && (
              <div className={`p-3 rounded-lg border text-sm text-center animate-fade-in ${
                authError.includes("Silakan periksa email")
                  ? "bg-green-50 border-green-200 text-green-600"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}>
                {authError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Sekolah
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@smktelkom-mlg.sch.id"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center gap-3 bg-red-600 text-white hover:bg-red-700 font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Memuat..." : (isRegistering ? "Daftar" : "Masuk")}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm text-slate-500 hover:text-red-600 transition-colors"
              >
                {isRegistering 
                  ? "Sudah punya akun? Masuk di sini" 
                  : "Belum punya akun? Daftar di sini"}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 SMK Telkom Malang. Supervisi Pembelajaran.
        </p>
      </div>
    </div>
  );
}
