import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import type { OrderResponse, PagedResponse, ProductResponse, OrderRequest } from '../types';
import { Plus, ShoppingCart, ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';

interface DraftItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Narudžbe i Prodaja</h1>
        <button
          onClick={openCreateOrderModal}
          className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Nova narudžba</span>
        </button>
      </div>

      {/* TABELA NARUDŽBI */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nema evidentiranih narudžbi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
                  <th className="p-4">Broj Narudžbe</th>
                  <th className="p-4">Datum</th>
                  <th className="p-4">Kupljeni Artikli</th>
                  <th className="p-4">Ukupan Iznos</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-mono font-semibold text-indigo-600">{order.orderNumber}</td>
                    <td className="p-4 text-slate-500">{new Date(order.orderDate).toLocaleDateString('bs-BA')}</td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-semibold text-slate-900">{item.productName}</span> x {item.quantity} 
                            <span className="text-slate-400"> ({Number(item.unitPrice).toFixed(2)} KM)</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{Number(order.totalAmount).toFixed(2)} KM</td>
                    <td className="p-4">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Završena
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINACIJA */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <span className="text-sm text-slate-500">
            Ukupno: <strong className="text-slate-800">{totalCount}</strong> narudžbi | Stranica <strong className="text-slate-800">{page}</strong> od <strong className="text-slate-800">{totalPages}</strong>
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL ZA KREIRANJE NARUDŽBE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl flex flex-col max-h-[90vh]">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-indigo-600" />
              <span>Nova narudžba</span>
            </h2>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            {productsLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="space-y-6 overflow-y-auto flex-1 pr-1">
                
                {/* DIO ZA DODAVANJE ARTIKLA U KORPU */}
                <div className="grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Izaberi proizvod</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value !== '' ? Number(e.target.value) : '')}
                      className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">-- Izaberite proizvod --</option>
                      {availableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ({Number(p.price).toFixed(2)} KM) - [Na stanju: {p.stockQuantity}]
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-24">
                      <label className="block text-sm font-medium text-slate-700">Količina</label>
                      <input
                        type="number"
                        min="1"
                        value={selectedQuantity}
                        onChange={(e) => setSelectedQuantity(Math.max(1, Number(e.target.value)))}
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddToDraft}
                      className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition self-end"
                    >
                      Dodaj
                    </button>
                  </div>
                </div>

                {/* PRIVREMENA KORPA (KORPA ZA KUPOVINU) */}
                <div className="space-y-3">
                  <h3 className="font-bold text-slate-700 text-sm">Stavke u korpi ({draftItems.length})</h3>
                  {draftItems.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">Korpa je prazna. Dodajte proizvode iznad.</p>
                  ) : (
                    <div className="border border-slate-100 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 font-semibold text-slate-600">
                          <tr>
                            <th className="p-3">Proizvod</th>
                            <th className="p-3">Količina</th>
                            <th className="p-3">Cijena</th>
                            <th className="p-3 text-right">Ukloni</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {draftItems.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50/50">
                              <td className="p-3 font-semibold">{item.productName}</td>
                              <td className="p-3">{item.quantity} kom</td>
                              <td className="p-3 font-semibold text-indigo-600">{(item.price * item.quantity).toFixed(2)} KM</td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromDraft(index)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-slate-100 transition"
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

                {/* UKUPAN IZNOS I AKCIJE */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Ukupan iznos narudžbe</p>
                    <p className="text-2xl font-bold text-slate-900">{calculateDraftTotal().toFixed(2)} KM</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Odustani
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitOrder}
                      disabled={draftItems.length === 0}
                      className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:bg-indigo-400"
                    >
                      Završi narudžbu
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};