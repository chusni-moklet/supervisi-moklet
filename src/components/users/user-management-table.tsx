"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { type User, type Role, ROLE_LABELS } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import RoleBadge from "@/components/ui/role-badge";
import PageHeader from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const ALL_ROLES: Role[] = ["SUPER_ADMIN", "KEPALA_SEKOLAH", "ADMIN", "GURU"];

export default function UserManagementTable() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch users from Supabase
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setUsers(data as User[]);
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [addingUser, setAddingUser] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // New user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<Role>("ADMIN");
  const [newDepartment, setNewDepartment] = useState("");
  const [newMapel, setNewMapel] = useState("");
  const [newKelas, setNewKelas] = useState("");

  // Edit role state
  const [editRole, setEditRole] = useState<Role>("ADMIN");

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, searchQuery]);

  const toast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleAddUser = async () => {
    if (!newName || !newEmail) return;

    const newUserObj: any = { name: newName, email: newEmail, role: newRole };
    if (newRole === "ADMIN" && newDepartment) {
      newUserObj.department = newDepartment;
    }
    if (newRole === "GURU") {
      if (newMapel) newUserObj.mapel = newMapel;
      if (newKelas) newUserObj.kelas = newKelas;
    }

    const { data, error } = await supabase
      .from("users")
      .insert([newUserObj])
      .select();

    if (error) {
      toast(`Error: ${error.message}`);
      return;
    }

    if (data && data.length > 0) {
      setUsers((prev) => [data[0] as User, ...prev]);
      toast(`User "${newName}" berhasil ditambahkan`);
    }

    setAddingUser(false);
    setNewName("");
    setNewEmail("");
    setNewRole("ADMIN");
    setNewDepartment("");
    setNewMapel("");
    setNewKelas("");
  };

  const handleChangeRole = async () => {
    if (!editingUser) return;

    const { error } = await supabase
      .from("users")
      .update({ role: editRole })
      .eq("id", editingUser.id);

    if (error) {
      toast(`Error: ${error.message}`);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? { ...u, role: editRole } : u)),
    );
    toast(`Role "${editingUser.name}" diubah menjadi ${ROLE_LABELS[editRole]}`);
    setEditingUser(null);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", deletingUser.id);

    if (error) {
      toast(`Error: ${error.message}`);
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    toast(`User "${deletingUser.name}" berhasil dihapus`);
    setDeletingUser(null);
  };

  return (
    <div>
      <PageHeader
        title="Manajemen User"
        description="Kelola akun pengguna dan role akses"
        actions={
          currentUser?.role === "SUPER_ADMIN" && (
            <button
              onClick={() => setAddingUser(true)}
              id="btn-add-user"
              className="btn btn-primary btn-sm"
            >
              <UserPlus className="w-4 h-4" />
              Tambah User
            </button>
          )
        }
      />

      {/* Search */}
      <div className="card p-4 mb-4 animate-fade-in">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="search-users"
            type="text"
            className="input pl-10"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {!isLoaded ? (
        <div className="card p-8 text-center text-slate-500 animate-pulse">
          Memuat data...
        </div>
      ) : (
        <div
          className="card overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>No</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Bagian</th>
                  <th>Role</th>
                  <th style={{ width: 140 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id}>
                    <td className="font-medium text-slate-400">{idx + 1}</td>
                    <td className="font-medium">{user.name}</td>
                    <td className="text-slate-500">{user.email}</td>
                    <td className="text-sm text-slate-600">
                      {user.role === "ADMIN" && user.department ? (
                        user.department
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td>
                      <RoleBadge role={user.role} />
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {currentUser?.role === "SUPER_ADMIN" && (
                          <>
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setEditRole(user.role);
                              }}
                              id={`btn-edit-${user.id}`}
                              className="btn btn-ghost btn-sm text-blue-600 hover:bg-blue-50"
                              title="Ubah Role"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingUser(user)}
                              id={`btn-delete-${user.id}`}
                              className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Tidak ada user ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add User Modal ───────────────────── */}
      {addingUser && (
        <>
          <div className="overlay" onClick={() => setAddingUser(false)} />
          <div className="modal" id="modal-add-user">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-800">
                Tambah User Baru
              </h3>
              <button
                onClick={() => setAddingUser(false)}
                className="btn-ghost p-1 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  id="input-new-name"
                  className="input"
                  placeholder="Masukkan nama lengkap"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  id="input-new-email"
                  type="email"
                  className="input"
                  placeholder="email@smktelkom-mlg.sch.id"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role
                </label>
                <select
                  id="select-new-role"
                  className="input select"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                >
                  {ALL_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </select>
              </div>

              {newRole === "ADMIN" && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-fade-in-up">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">
                    Informasi Tambahan (Opsional)
                  </h4>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Bagian
                    </label>
                    <select
                      className="input select text-sm py-1.5 px-3"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                    >
                      <option value="">Pilih Bagian</option>
                      {[
                        "Hubinkom",
                        "Kesiswaan",
                        "Kurikulum",
                        "QDPM",
                        "Sarpra",
                        "Tata Usaha",
                      ].map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {newRole === "GURU" && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-fade-in-up">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">
                    Informasi Tambahan (Opsional)
                  </h4>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Mapel
                    </label>
                    <input
                      className="input text-sm py-1.5 px-3"
                      placeholder="Masukkan Mapel"
                      value={newMapel}
                      onChange={(e) => setNewMapel(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Kelas
                    </label>
                    <input
                      className="input text-sm py-1.5 px-3"
                      placeholder="Contoh: X RPL 1"
                      value={newKelas}
                      onChange={(e) => setNewKelas(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setAddingUser(false)}
                  className="btn btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddUser}
                  id="btn-confirm-add"
                  className="btn btn-primary flex-1"
                  disabled={!newName || !newEmail}
                >
                  <UserPlus className="w-4 h-4" />
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Edit Role Modal ──────────────────── */}
      {editingUser && (
        <>
          <div className="overlay" onClick={() => setEditingUser(null)} />
          <div className="modal" id="modal-edit-role">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-800">
                Ubah Role
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="btn-ghost p-1 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Ubah role untuk{" "}
              <span className="font-medium text-slate-700">
                {editingUser.name}
              </span>
            </p>
            <div className="space-y-2 mb-5">
              {ALL_ROLES.map((role) => (
                <label
                  key={role}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    editRole === role
                      ? "border-tech-blue bg-blue-50"
                      : "border-slate-200 hover:border-slate-300",
                  )}
                >
                  <input
                    type="radio"
                    name="edit-role"
                    value={role}
                    checked={editRole === role}
                    onChange={() => setEditRole(role)}
                    className="accent-tech-blue"
                  />
                  <span className="text-sm font-medium">
                    {ROLE_LABELS[role]}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="btn btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={handleChangeRole}
                id="btn-confirm-edit"
                className="btn btn-primary flex-1"
              >
                Simpan
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Delete Confirmation Modal ────────── */}
      {deletingUser && (
        <>
          <div className="overlay" onClick={() => setDeletingUser(null)} />
          <div className="modal" id="modal-delete-user">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Hapus User
                </h3>
                <p className="text-sm text-slate-500">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              Apakah Anda yakin ingin menghapus user{" "}
              <span className="font-semibold">{deletingUser.name}</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="btn btn-secondary flex-1"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
                id="btn-confirm-delete"
                className="btn btn-danger flex-1"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Toast ────────────────────────────── */}
      {showToast && (
        <div className="toast toast-success flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {showToast}
        </div>
      )}
    </div>
  );
}
