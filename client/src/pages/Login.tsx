import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, Loader2, Boxes, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 font-sans sm:px-6 lg:px-8">
      <div className="w-full max-w-[420px]">

        {/* Naslov */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 shadow-lg shadow-slate-950/10">
            <Boxes className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
            Prijavite se u sistem
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Unesite svoje pristupne podatke za upravljanje zalihama
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm shadow-slate-900/[0.03]">

          {/* Prikaz API greške sa backenda */}
          {apiError && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
              <AlertCircle className="mt-px h-4 w-4 shrink-0" />
              <span className="leading-relaxed">{apiError}</span>
            </div>
          )}

          {/* Forma */}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">

              {/* Email Unos */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Email adresa</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-[18px] w-[18px] text-slate-400" />
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    className={`block w-full rounded-xl border-0 bg-slate-50/80 py-2.5 pl-11 pr-3.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'ring-rose-300 focus:ring-rose-500/40'
                        : 'ring-slate-200 focus:ring-indigo-600/30'
                    }`}
                    placeholder="admin@test.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Unos */}
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Lozinka</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-[18px] w-[18px] text-slate-400" />
                  </div>
                  <input
                    type="password"
                    {...register('password')}
                    className={`block w-full rounded-xl border-0 bg-slate-50/80 py-2.5 pl-11 pr-3.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                      errors.password
                        ? 'ring-rose-300 focus:ring-rose-500/40'
                        : 'ring-slate-200 focus:ring-indigo-600/30'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.password.message}</p>
                )}
              </div>

            </div>

            {/* Dugme za slanje */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400 disabled:shadow-none"
              >
                {submitting ? (
                  <Loader2 className="h-[18px] w-[18px] animate-spin" />
                ) : (
                  <>
                    <span>Prijavi se</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Zaštićen pristup — samo za ovlaštene korisnike</span>
        </p>

      </div>
    </div>
  );
};
