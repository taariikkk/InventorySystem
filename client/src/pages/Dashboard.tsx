import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import type { DashboardSummaryResponse } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Package, ShoppingBag, DollarSign, TrendingUp, Loader2, AlertCircle, BarChart3, Trophy } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Poziv API-ja za preuzimanje analitike
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<DashboardSummaryResponse>('/Dashboard/summary');
      setSummary(response.data);
    } catch {
      setError('Greška pri učitavanju podataka za dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      await fetchDashboardData();
    };
    loadData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-400">Učitavanje analitike...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm font-medium text-rose-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error || 'Došlo je do greške.'}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* NASLOV STRANICE */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Pregled poslovanja, prihoda i najprodavanijih artikala.</p>
      </div>

      {/* 1. KARTICE SA METRIKAMA (KPI Cards) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {/* Kartica: Ukupno proizvoda */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-900/[0.03] transition-all hover:border-slate-300/70 hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2.5">
              <p className="text-[13px] font-medium text-slate-500">Ukupno proizvoda</p>
              <h3 className="text-[28px] font-semibold leading-none tracking-tight text-slate-900">{summary.totalProducts}</h3>
              <p className="text-xs text-slate-400">Aktivni artikli u katalogu</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700 ring-1 ring-inset ring-slate-200/60">
              <Package className="h-[18px] w-[18px]" />
            </div>
          </div>
        </div>

        {/* Kartica: Ukupno narudžbi */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-900/[0.03] transition-all hover:border-slate-300/70 hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2.5">
              <p className="text-[13px] font-medium text-slate-500">Ukupno narudžbi</p>
              <h3 className="text-[28px] font-semibold leading-none tracking-tight text-slate-900">{summary.totalOrders}</h3>
              <p className="text-xs text-slate-400">Evidentirane transakcije</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 ring-1 ring-inset ring-emerald-100">
              <ShoppingBag className="h-[18px] w-[18px]" />
            </div>
          </div>
        </div>

        {/* Kartica: Ukupni prihod */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-900/[0.03] transition-all hover:border-slate-300/70 hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2.5">
              <p className="text-[13px] font-medium text-slate-500">Ukupni prihod</p>
              <h3 className="text-[28px] font-semibold leading-none tracking-tight text-slate-900">
                {Number(summary.totalRevenue).toFixed(2)}
                <span className="ml-1.5 text-base font-medium text-slate-400">KM</span>
              </h3>
              <p className="text-xs text-slate-400">Kumulativna vrijednost prodaje</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 ring-1 ring-inset ring-indigo-100">
              <DollarSign className="h-[18px] w-[18px]" />
            </div>
          </div>
        </div>

      </div>

      {/* 2. GRAFIKON I TABELA TOP PROIZVODA */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Lijeva strana: Grafikon prihoda po mjesecima (Recharts) */}
        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-900/[0.03] lg:col-span-2">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-600 ring-1 ring-inset ring-slate-200/60">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">Prihod po mjesecima</h3>
                <p className="mt-0.5 text-xs text-slate-400">Vrijednost prodaje izražena u KM</p>
              </div>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100 sm:flex">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Zadnjih 6 mjeseci</span>
            </div>
          </div>

          <div className="h-80 w-full px-3 py-5 pr-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(79, 70, 229, 0.05)', radius: 6 }}
                  contentStyle={{
                    background: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.45)',
                    color: '#fff',
                    padding: '10px 14px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}
                  itemStyle={{ color: '#fff', fontWeight: 600 }}
                  formatter={(value) => [`${Number(value).toFixed(2)} KM`, 'Prihod']}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Desna strana: Top 5 najprodavanijih proizvoda */}
        <div className="flex flex-col rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-900/[0.03]">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 ring-1 ring-inset ring-amber-100">
              <Trophy className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">Najprodavaniji artikli</h3>
              <p className="mt-0.5 text-xs text-slate-400">Rangirano po ostvarenom prihodu</p>
            </div>
          </div>

          <div className="flex-1 divide-y divide-slate-100 px-6">
            {summary.topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-semibold text-slate-500 ring-1 ring-inset ring-slate-200/60">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-semibold text-slate-900">{product.productName}</p>
                    <p className="text-xs text-slate-500">
                      Prodato <strong className="font-semibold text-slate-700">{product.totalQuantitySold} kom</strong>
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-indigo-600">{Number(product.totalRevenueGenerated).toFixed(2)} KM</p>
                  <p className="text-[11px] text-slate-400">Ukupan prihod</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
