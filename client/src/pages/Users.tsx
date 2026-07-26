import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { UserResponse, CreateUserRequest } from '../types';
import { Plus, Trash2, UserPlus, Loader2, Shield, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import axios from 'axios';

const inputWithIconClasses =
  'block w-full rounded-xl border-0 bg-slate-50/80 py-2.5 pl-11 pr-3.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30';

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'Admin' | 'Manager' | 'Worker'>('Worker');
  const [formError, setFormError] = useState<string | null>(null);

  // 1. Učitavanje korisnika
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<UserResponse[]>('/Users');
      setUsers(response.data);
    } catch {
      setError('Greška pri učitavanju korisnika.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // 2. Brisanje korisnika (Soft Delete)
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Da li ste sigurni da želite obrisati ovog korisnika?')) return;

    try {
      await api.delete(`/Users/${id}`);
      fetchUsers(); // Osvježi tabelu
    } catch (err) {
      let message = 'Greška pri brisanju korisnika.';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      alert(message);
    }
  };

  // 3. Slanje forme (Kreiranje korisnika)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const roleMap: Record<string, number> = { Admin: 0, Manager: 1, Worker: 2 };

    const payload: CreateUserRequest = {
      username: formUsername,
      email: formEmail,
      password: formPassword,
      role: roleMap[formRole],
    };

    try {
      await api.post('/Users', payload);
      setIsModalOpen(false);
      fetchUsers(); // Osvježi tabelu
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || 'Došlo je do greške pri kreiranju.');
      }
    }
  };

  const openModal = () => {
    setFormUsername('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('Worker');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Bezbjednosna provjera na nivou cijele stranice (Samo Admin smije vidjeti ovo!)
  if (currentUser?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Upravljanje korisnicima</h1>
          <p className="text-sm text-slate-500">Dodajte članove tima i dodijelite im odgovarajuće uloge.</p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          <span>Novi korisnik</span>
        </button>
      </div>

      {/* TABELA KORISNIKA */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-900/[0.03]">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-400">Učitavanje korisnika...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2.5 p-12 text-sm font-medium text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Korisnik</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Email</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Uloga</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Datum kreiranja</th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200/60">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-slate-900">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                        u.role === 'Admin'
                          ? 'bg-indigo-50 text-indigo-700 ring-indigo-100'
                          : u.role === 'Manager'
                          ? 'bg-amber-50 text-amber-700 ring-amber-100'
                          : 'bg-slate-100 text-slate-600 ring-slate-200/70'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          u.role === 'Admin' ? 'bg-indigo-500' : u.role === 'Manager' ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 tabular-nums">
                      {new Date(u.createdAt).toLocaleDateString('bs-BA')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Sprečavamo admina da obriše sam sebe na klijentu */}
                      {u.email !== currentUser?.email ? (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="inline-flex rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          title="Ukloni korisnika"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-400 ring-1 ring-inset ring-slate-200/60">
                          Trenutni korisnik
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL ZA KREIRANJE KORISNIKA */}
      {isModalOpen && (
        <div className="animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md">
          <div className="animate-panel w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-950/20">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 ring-1 ring-inset ring-indigo-100">
                <UserPlus className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">Dodaj novog člana tima</h2>
                <p className="mt-0.5 text-xs text-slate-400">Kreirajte pristupne podatke i dodijelite ulogu.</p>
              </div>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="space-y-4 px-6 py-5">
                {formError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                    <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                    <span className="leading-relaxed">{formError}</span>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Korisničko ime</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <UserIcon className="h-[18px] w-[18px] text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className={inputWithIconClasses}
                      placeholder="npr. haris"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Email adresa</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Mail className="h-[18px] w-[18px] text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className={inputWithIconClasses}
                      placeholder="haris@test.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Privremena lozinka</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Lock className="h-[18px] w-[18px] text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className={inputWithIconClasses}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Uloga (Role)</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Shield className="h-[18px] w-[18px] text-slate-400" />
                    </div>
                    <select
                      value={formRole}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormRole(e.target.value as 'Admin' | 'Manager' | 'Worker')}
                      className={inputWithIconClasses}
                    >
                      <option value="Worker">Worker (Samo pregled i prodaja)</option>
                      <option value="Manager">Manager (Upravljanje zalihama)</option>
                      <option value="Admin">Admin (Sva prava)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:bg-indigo-500"
                >
                  Kreiraj korisnika
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
