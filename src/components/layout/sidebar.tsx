'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  ListChecks,
  Users,
  LogOut,
  X,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    permissions: [] as string[], // accessible by all
  },
  {
    href: '/data-supervisi',
    label: 'Data Supervisi',
    icon: FileText,
    permissions: ['view_all_observations'],
  },
  {
    href: '/observasi',
    label: 'Form Observasi',
    icon: ClipboardList,
    permissions: ['create_observation'],
  },
  {
    href: '/aspek-indikator',
    label: 'Aspek & Indikator',
    icon: ListChecks,
    permissions: ['manage_indicators'],
  },
  {
    href: '/manajemen-user',
    label: 'Manajemen User',
    icon: Users,
    permissions: ['manage_users'],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, hasPermission, logout } = useAuth();

  if (!currentUser) return null;

  const filteredNav = NAV_ITEMS.filter(item => {
    if (item.permissions.length === 0) return true;
    return item.permissions.some(p => hasPermission(p as never));
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="overlay lg:hidden"
          onClick={onClose}
          id="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={cn(
          'fixed top-0 left-0 h-full z-50 lg:z-30 transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ width: 'var(--sidebar-width)' }}
      >
        <div className="h-full flex flex-col bg-white border-r border-slate-200 shadow-lg lg:shadow-none">
          {/* Brand Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-red flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800 leading-tight">
                  Supervisi Moklet
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">
                  SMK Telkom Malang
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden btn-ghost p-2 rounded-lg"
              id="close-sidebar"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Menu
            </p>
            {filteredNav.map(item => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  id={`nav-${item.href.replace('/', '') || 'dashboard'}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-tech-blue shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800',
                  )}
                >
                  <Icon
                    className={cn(
                      'w-[18px] h-[18px] flex-shrink-0',
                      isActive ? 'text-tech-blue' : 'text-slate-400',
                    )}
                  />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-tech-blue" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info + Logout */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full gradient-blue flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {ROLE_LABELS[currentUser.role]}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              id="btn-logout"
              className="btn btn-ghost w-full text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
