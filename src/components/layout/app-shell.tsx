'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from './sidebar';
import Header from './header';
import { useEffect } from 'react';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/observasi': 'Form Observasi',
  '/aspek-indikator': 'Aspek & Indikator',
  '/manajemen-user': 'Manajemen User',
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuth();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated && pathname !== '/login') {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitializing, pathname, router]);

  // Show nothing while initializing or redirecting
  if (isInitializing || !isAuthenticated) return null;

  const title = PAGE_TITLES[pathname] || 'Supervisi Moklet';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="lg:transition-all lg:duration-300"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >
        {/* On mobile, remove the margin */}
        <style>{`
          @media (max-width: 1023px) {
            [style*="margin-left: var(--sidebar-width)"] {
              margin-left: 0 !important;
            }
          }
        `}</style>

        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={title}
        />

        <main className="p-4 lg:p-6 max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
