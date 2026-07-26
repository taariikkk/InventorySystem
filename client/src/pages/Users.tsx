import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { UserResponse, CreateUserRequest } from '../types';
import { Plus, Trash2, UserPlus, Loader2, Shield, Mail, Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Upravljanje korisnicima</h1>
        <button
          onClick={openModal}
          className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Novi korisnik</span>
        </button>
      </div>

      {/* TABELA KORISNIKA */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
                  <th className="p-4">Korisnik</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Uloga</th>
                  <th className="p-4">Datum Kreiranja</th>
                  <th className="p-4 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-slate-100 p-2 rounded-full text-slate-600">
                          <UserIcon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-slate-900">{u.username}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">{u.email}</td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === 'Admin' 
                          ? 'bg-red-50 text-red-700' 
                          : u.role === 'Manager'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('bs-BA')}
                    </td>
                    <td className="p-4 text-right">
                      {/* Sprečavamo admina da obriše sam sebe na klijentu */}
                      {u.email !== currentUser?.email ? (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="inline-flex p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600 transition"
                          title="Ukloni korisnika"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300 italic px-2">Ti (Ti si prijavljen)</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-indigo-600" />
              <span>Dodaj novog člana tima</span>
            </h2>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Korisničko ime</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder="npr. haris"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Email adresa</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder="haris@test.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Privremena lozinka</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Uloga (Role)</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Shield className="h-5 w-5 text-slate-400" />
                  </div>
                  <select
                    value={formRole}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormRole(e.target.value as 'Admin' | 'Manager' | 'Worker')}
                    className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  >
                    <option value="Worker">Worker (Samo pregled i prodaja)</option>
                    <option value="Manager">Manager (Upravljanje zalihama)</option>
                    <option value="Admin">Admin (Sva prava)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
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