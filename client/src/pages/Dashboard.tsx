import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import type { DashboardSummaryResponse } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Package, ShoppingBag, DollarSign, TrendingUp, Loader2 } from 'lucide-react';

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
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
        {error || 'Došlo je do greške.'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* 1. KARTICE SA METRIKAMA (KPI Cards) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        
        {/* Kartica: Ukupno proizvoda */}
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">Ukupno proizvoda</p>
            <h3 className="text-3xl font-bold text-slate-900">{summary.totalProducts}</h3>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
            <Package className="h-6 w-6" />
          </div>
        </div>

        {/* Kartica: Ukupno narudžbi */}
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">Ukupno narudžbi</p>
            <h3 className="text-3xl font-bold text-slate-900">{summary.totalOrders}</h3>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Kartica: Ukupni prihod */}
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">Ukupni prihod</p>
            <h3 className="text-3xl font-bold text-slate-900">{Number(summary.totalRevenue).toFixed(2)} KM</h3>
          </div>
          <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* 2. GRAFIKON I TABELA TOP PROIZVODA */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Lijeva strana: Grafikon prihoda po mjesecima (Recharts) */}
        <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Prihod po mjesecima</h3>
            <div className="flex items-center space-x-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Zadnjih 6 mjeseci</span>
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ background: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                  formatter={(value) => [`${Number(value).toFixed(2)} KM`, 'Prihod']}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Desna strana: Top 5 najprodavanijih proizvoda */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Najprodavaniji artikli</h3>
          
          <div className="divide-y divide-slate-100">
            {summary.topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <p className="font-semibold text-sm text-slate-900">{product.productName}</p>
                  <p className="text-xs text-slate-500">Prodato: <strong className="text-slate-700">{product.totalQuantitySold} kom</strong></p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-indigo-600">{Number(product.totalRevenueGenerated).toFixed(2)} KM</p>
                  <p className="text-xs text-slate-400">Ukupan prihod</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};