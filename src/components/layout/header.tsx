"use client";

import { Menu, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { type Role, ROLE_LABELS } from "@/lib/types";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuToggle: () => void;
  title: string;
}

const ROLES: Role[] = ["SUPER_ADMIN", "KEPALA_SEKOLAH", "ADMIN"];

const ROLE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700 border-red-200",
  KEPALA_SEKOLAH: "bg-purple-100 text-purple-700 border-purple-200",
  ADMIN: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function Header({ onMenuToggle, title }: HeaderProps) {
  const { currentUser, switchRole } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  return (
    <header
      id="main-header"
      className="glass-header sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6"
      style={{ height: "var(--header-height)" }}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          id="btn-menu-toggle"
          className="lg:hidden btn-ghost p-2 rounded-lg"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Dev Role Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            id="btn-role-switcher"
            className={cn(
              "badge border cursor-pointer transition-all duration-200 hover:shadow-sm flex items-center gap-1.5 py-1.5 px-3",
              ROLE_COLORS[currentUser.role],
            )}
          >
            <span className="hidden sm:inline text-[11px] uppercase tracking-wide font-bold">
              DEV
            </span>
            <span className="text-xs font-semibold">
              {ROLE_LABELS[currentUser.role]}
            </span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200",
                isDropdownOpen && "rotate-180",
              )}
            />
          </button>

          {isDropdownOpen && (
            <div
              id="role-switcher-dropdown"
              className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 animate-scale-in"
            >
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Switch Role
              </p>
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    switchRole(role);
                    setIsDropdownOpen(false);
                  }}
                  id={`switch-role-${role.toLowerCase()}`}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors",
                    currentUser.role === role
                      ? "bg-blue-50 text-tech-blue font-medium"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      currentUser.role === role
                        ? "bg-tech-blue"
                        : "bg-slate-300",
                    )}
                  />
                  {ROLE_LABELS[role]}
                  {currentUser.role === role && (
                    <span className="ml-auto text-[10px] font-bold uppercase text-tech-blue">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          id="btn-notifications"
          className="btn-ghost p-2 rounded-lg relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-telkom-red" />
        </button>

        {/* User Avatar */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center text-white text-xs font-semibold">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
