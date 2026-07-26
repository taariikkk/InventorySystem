import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, Loader2 } from 'lucide-react';
import axios from 'axios';

// 1. Definišemo Zod šemu validacije (Pravila za unos)
const loginSchema = z.object({
  email: z.string().email('Unesite ispravnu email adresu.'),
  password: z.string().min(6, 'Lozinka must imati najmanje 6 karaktera.'),
});

// Izvlačimo TypeScript tip na osnovu Zod šeme
type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 2. Inicijalizujemo React Hook Form sa Zod resolverom
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // 3. Funkcija koja se poziva kada je klijentska validacija uspješna
  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    setSubmitting(true);

    try {
      await login(data);
      navigate('/');
    } catch (error) {
      let errorMessage = 'Došlo je do greške pri prijavi.';

      // Provjeravamo da li je greška stvarna Axios greška sa našeg API-ja
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }

      setApiError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-md">
        
        {/* Naslov */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            Prijavite se u sistem
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Unesite svoje pristupne podatke za upravljanje zalihama
          </p>
        </div>

        {/* Prikaz API greške sa backenda */}
        {apiError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {apiError}
          </div>
        )}

        {/* Forma */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md">
            
            {/* Email Unos */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Email adresa</label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  className={`block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                    errors.email 
                      ? 'ring-red-300 focus:ring-red-500' 
                      : 'ring-slate-300 focus:ring-indigo-600'
                  }`}
                  placeholder="admin@test.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Unos */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Lozinka</label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  className={`block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                    errors.password 
                      ? 'ring-red-300 focus:ring-red-500' 
                      : 'ring-slate-300 focus:ring-indigo-600'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

          </div>

          {/* Dugme za slanje */}
          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400 transition"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                'Prijavi se'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};