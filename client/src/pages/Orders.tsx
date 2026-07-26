import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import type { OrderResponse, PagedResponse, ProductResponse, OrderRequest } from '../types';
import { Plus, ShoppingCart, ChevronLeft, ChevronRight, Loader2, Trash2, AlertCircle, Inbox } from 'lucide-react';
import axios from 'axios';

interface DraftItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

const fieldClasses =
  'block w-full rounded-xl border-0 bg-white py-2.5 px-3.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/30';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Paginacija
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State (Kreiranje narudžbe)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<ProductResponse[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // State za unos stavke unutar modala
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  // 1. POZIV API-JA: Učitavanje narudžbi
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<PagedResponse<OrderResponse>>('/Orders', {
        params: {
          pageNumber: page,
          pageSize,
        },
      });
      setOrders(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch {
      setError('Greška pri učitavanju narudžbi.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    const loadOrders = async () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      await fetchOrders();
    };
    loadOrders();
  }, [fetchOrders]);

  // Otvaranje modala i učitavanje proizvoda iz baze
  const openCreateOrderModal = async () => {
    setIsModalOpen(true);
    setProductsLoading(true);
    setDraftItems([]);
    setFormError(null);
    setSelectedProductId('');
    setSelectedQuantity(1);

    try {
      // Povlačimo sve proizvode bez paginacije (ili prvu veliku stranicu) za dropdown
      const response = await api.get<PagedResponse<ProductResponse>>('/Products', {
        params: { pageSize: 100 },
      });
      setAvailableProducts(response.data.items);
    } catch {
      setFormError('Greška pri učitavanju dostupnih proizvoda.');
    } finally {
      setProductsLoading(false);
    }
  };

  // Dodavanje stavke u privremenu korpu (Draft)
  const handleAddToDraft = () => {
    setFormError(null);
    if (selectedProductId === '') {
      setFormError('Molimo izaberite proizvod.');
      return;
    }
    if (selectedQuantity <= 0) {
      setFormError('Količina mora biti veća od nule.');
      return;
    }

    const product = availableProducts.find((p) => p.id === Number(selectedProductId));
    if (!product) return;

    // Provjera da li je proizvod već u korpi
    const existingIndex = draftItems.findIndex((item) => item.productId === product.id);

    if (existingIndex > -1) {
      // Ako jeste, ažuriramo količinu
      const updated = [...draftItems];
      updated[existingIndex].quantity += selectedQuantity;
      setDraftItems(updated);
    } else {
      // Ako nije, dodajemo novi
      setDraftItems([
        ...draftItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: selectedQuantity,
          price: product.price,
        },
      ]);
    }

    // Resetujemo unos za sljedeću stavku
    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  // Uklanjanje stavke iz korpe
  const handleRemoveFromDraft = (index: number) => {
    setDraftItems(draftItems.filter((_, i) => i !== index));
  };

  // Računanje ukupnog iznosa u korpi
  const calculateDraftTotal = () => {
    return draftItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // 2. SLANJE NARUDŽBE NA BACKEND (Transakciono)
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (draftItems.length === 0) {
      setFormError('Morate dodati barem jedan proizvod u narudžbu.');
      return;
    }

    const payload: OrderRequest = {
      items: draftItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      await api.post('/Orders', payload);
      setIsModalOpen(false);
      fetchOrders(); // Osvježavamo listu narudžbi
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || 'Greška pri kreiranju narudžbe.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Narudžbe i prodaja</h1>
          <p className="text-sm text-slate-500">Evidentirajte prodaju i pregledajte istoriju transakcija.</p>
        </div>
        <button
          onClick={openCreateOrderModal}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40 focus-visible:ring-offset-2 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nova narudžba</span>
        </button>
      </div>

      {/* TABELA NARUDŽBI */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-900/[0.03]">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-400">Učitavanje narudžbi...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2.5 p-12 text-sm font-medium text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-400 ring-1 ring-inset ring-slate-200/60">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">Nema evidentiranih narudžbi.</p>
          </div>
        ) : (
          <>
          {/* MOBILNI PRIKAZ: kartice narudžbi */}
          <div className="divide-y divide-slate-100 md:hidden">
            {orders.map((order) => (
              <div key={order.id} className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-md bg-indigo-50 px-2 py-1 font-mono text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {new Date(order.orderDate).toLocaleDateString('bs-BA')}
                  </span>
                </div>

                <div className="space-y-1.5 rounded-xl bg-slate-50/70 p-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate font-semibold text-slate-900">{item.productName}</span>
                      <span className="shrink-0 text-slate-500 tabular-nums">
                        {item.quantity} × {Number(item.unitPrice).toFixed(2)} KM
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Završena
                  </span>
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">
                    {Number(order.totalAmount).toFixed(2)} KM
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP / TABLET PRIKAZ: klasična tabela */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Broj narudžbe</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Datum</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Kupljeni artikli</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Ukupan iznos</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-indigo-50 px-2 py-1 font-mono text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 tabular-nums">{new Date(order.orderDate).toLocaleDateString('bs-BA')}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs">
                            <span className="font-semibold text-slate-900">{item.productName}</span>
                            <span className="text-slate-400">×</span>
                            <span className="font-medium text-slate-600 tabular-nums">{item.quantity}</span>
                            <span className="text-slate-400 tabular-nums">({Number(item.unitPrice).toFixed(2)} KM)</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 tabular-nums">{Number(order.totalAmount).toFixed(2)} KM</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Završena
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* PAGINACIJA */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-6">
          <span className="text-xs text-slate-500">
            Ukupno <strong className="font-semibold text-slate-800">{totalCount}</strong> narudžbi
            <span className="mx-2 text-slate-300">|</span>
            Stranica <strong className="font-semibold text-slate-800">{page}</strong> od <strong className="font-semibold text-slate-800">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200"
            >
              <ChevronLeft className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200"
            >
              <ChevronRight className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL ZA KREIRANJE NARUDŽBE */}
      {isModalOpen && (
        <div className="animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md">
          <div className="animate-panel flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-950/20">
            <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 ring-1 ring-inset ring-indigo-100">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">Nova narudžba</h2>
                <p className="mt-0.5 text-xs text-slate-400">Dodajte artikle u korpu i završite prodaju.</p>
              </div>
            </div>

            {productsLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 p-16">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <p className="text-sm font-medium text-slate-400">Učitavanje proizvoda...</p>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">

                  {formError && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                      <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                      <span className="leading-relaxed">{formError}</span>
                    </div>
                  )}

                  {/* DIO ZA DODAVANJE ARTIKLA U KORPU */}
                  <div className="grid grid-cols-1 items-end gap-4 rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Izaberi proizvod</label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value !== '' ? Number(e.target.value) : '')}
                        className={fieldClasses}
                      >
                        <option value="">-- Izaberite proizvod --</option>
                        {availableProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - ({Number(p.price).toFixed(2)} KM) - [Na stanju: {p.stockQuantity}]
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="w-24 shrink-0">
                        <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Količina</label>
                        <input
                          type="number"
                          min="1"
                          value={selectedQuantity}
                          onChange={(e) => setSelectedQuantity(Math.max(1, Number(e.target.value)))}
                          className={`${fieldClasses} tabular-nums`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddToDraft}
                        className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800"
                      >
                        Dodaj
                      </button>
                    </div>
                  </div>

                  {/* PRIVREMENA KORPA (KORPA ZA KUPOVINU) */}
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                      Stavke u korpi
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 tabular-nums ring-1 ring-inset ring-slate-200/60">
                        {draftItems.length}
                      </span>
                    </h3>
                    {draftItems.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
                        <p className="text-sm text-slate-400">Korpa je prazna. Dodajte proizvode iznad.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200/70">
                        <table className="w-full min-w-[26rem] text-left text-sm">
                          <thead className="bg-slate-50/80">
                            <tr>
                              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Proizvod</th>
                              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Količina</th>
                              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Cijena</th>
                              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Ukloni</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {draftItems.map((item, index) => (
                              <tr key={index} className="transition-colors hover:bg-slate-50/70">
                                <td className="px-4 py-3 font-semibold text-slate-900">{item.productName}</td>
                                <td className="px-4 py-3 tabular-nums">{item.quantity} kom</td>
                                <td className="px-4 py-3 font-semibold text-slate-900 tabular-nums">{(item.price * item.quantity).toFixed(2)} KM</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFromDraft(index)}
                                    className="inline-flex rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>

                {/* UKUPAN IZNOS I AKCIJE */}
                <div className="flex shrink-0 flex-col gap-4 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-baseline justify-between gap-3 sm:block">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Ukupan iznos</p>
                    <p className="text-xl font-semibold tracking-tight text-slate-900 tabular-nums sm:mt-0.5">
                      {calculateDraftTotal().toFixed(2)}
                      <span className="ml-1 text-sm font-medium text-slate-400">KM</span>
                    </p>
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      Odustani
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitOrder}
                      disabled={draftItems.length === 0}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400 disabled:shadow-none"
                    >
                      Završi narudžbu
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
