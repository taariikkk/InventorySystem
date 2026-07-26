import React, { useEffect, useState, useCallback } from 'react'; // Dodan useCallback
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { ProductResponse, PagedResponse, ProductRequest } from '../types';
import { Plus, Search, Trash2, Edit2, ChevronLeft, ChevronRight, Loader2, AlertCircle, PackageSearch } from 'lucide-react';
import axios from 'axios';

const inputClasses =
  'block w-full rounded-xl border-0 bg-slate-50/80 py-2.5 px-3.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 transition placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/30';

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filteri i Paginacija
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5); // Prikazujemo po 5 proizvoda radi lakšeg testiranja paginacije
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal State (za Kreiranje / Izmjenu)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const [formName, setFormName] = useState('');
  const [formSKU, setFormSKU] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(0);
  const [formError, setFormError] = useState<string | null>(null);

// 1. NAPREDNI UPIT: Pretraga, filtriranje i paginacija (Memoizovana verzija)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<PagedResponse<ProductResponse>>('/Products', {
        params: {
          searchTerm: searchTerm || undefined,
          minPrice: minPrice !== '' ? minPrice : undefined,
          maxPrice: maxPrice !== '' ? maxPrice : undefined,
          pageNumber: page,
          pageSize,
        },
      });
      setProducts(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch {
      // Riješeno: Izbrisali smo neiskorišteni 'err' parametar jer nam ne treba
      setError('Greška pri učitavanju proizvoda.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, minPrice, maxPrice, page, pageSize]); // Zavisnosti za useCallback

  useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts();
    };

    loadProducts();
  }, [fetchProducts]);

  // 2. BRISANJE (Soft Delete)
  const handleDelete = async (id: number) => {
    if (!window.confirm('Da li ste sigurni da želite obrisati ovaj proizvod?')) return;

    try {
      await api.delete(`/Products/${id}`);
      fetchProducts(); // Ponovo učitavamo tabelu
    } catch (err) {
      let message = 'Greška pri brisanju proizvoda.';
      // Riješeno: Bezbjedna provjera tipa umjesto "any"
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      }
      alert(message);
    }
  };

  // Otvaranje modala za kreiranje novog proizvoda
  const openCreateModal = () => {
    setSelectedProduct(null);
    setFormName('');
    setFormSKU('');
    setFormDescription('');
    setFormPrice(0);
    setFormStock(0);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Otvaranje modala za uređivanje postojećeg proizvoda
  const openEditModal = (product: ProductResponse) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormSKU(product.sku);
    setFormDescription(product.description);
    setFormPrice(product.price);
    setFormStock(product.stockQuantity);
    setFormError(null);
    setIsModalOpen(true);
  };

  // 3. SNIMANJE PODATAKA (Submit forme unutar modala)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload: ProductRequest = {
      name: formName,
      sku: formSKU,
      description: formDescription,
      price: formPrice,
      stockQuantity: formStock,
    };

    try {
      if (selectedProduct) {
        // Ako uredujemo postojeći
        await api.put(`/Products/${selectedProduct.id}`, payload);
      } else {
        // Ako kreiramo novi
        await api.post('/Products', payload);
      }
      setIsModalOpen(false);
      fetchProducts(); // Osvježi podatke
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFormError(err.response?.data?.message || 'Došlo je do greške.');
      }
    }
  };

  // Bezbjednosna provjera uloge na frontendu
  const isAllowedToEdit = user?.role === 'Admin' || user?.role === 'Manager';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Upravljanje proizvodima</h1>
          <p className="text-sm text-slate-500">Pretražujte katalog, pratite zalihe i uređujte artikle.</p>
        </div>

        {/* Kreiraj dugme se prikazuje SAMO Adminima i Managerima */}
        {isAllowedToEdit && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/40 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Novi proizvod</span>
          </button>
        )}
      </div>

      {/* FILTERI (Pretraga i Raspon cijena) */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/[0.03] sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pretraži po nazivu ili SKU..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className={`${inputClasses} pl-11`}
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Min cijena..."
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value !== '' ? Number(e.target.value) : ''); setPage(1); }}
            className={inputClasses}
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Max cijena..."
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value !== '' ? Number(e.target.value) : ''); setPage(1); }}
            className={inputClasses}
          />
        </div>
      </div>

      {/* TABELA PROIZVODA */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm shadow-slate-900/[0.03]">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
            <p className="text-sm font-medium text-slate-400">Učitavanje proizvoda...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2.5 p-12 text-sm font-medium text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-400 ring-1 ring-inset ring-slate-200/60">
              <PackageSearch className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">Nema pronađenih proizvoda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Naziv</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">SKU</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Cijena</th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Zaliha</th>
                  {isAllowedToEdit && <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Akcije</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      <div className="mt-0.5 max-w-xs truncate text-xs text-slate-400">{product.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-50 px-2 py-1 font-mono text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200/70">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 tabular-nums">{Number(product.price).toFixed(2)} KM</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                        product.stockQuantity > 5
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                          : 'bg-amber-50 text-amber-700 ring-amber-100'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${product.stockQuantity > 5 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {product.stockQuantity} kom
                      </span>
                    </td>
                    {isAllowedToEdit && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(product)}
                            className="inline-flex rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                            title="Uredi"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="inline-flex rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                            title="Obriši"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINACIJA (Prethodna / Sljedeća) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <span className="text-xs text-slate-500">
            Ukupno <strong className="font-semibold text-slate-800">{totalCount}</strong> proizvoda
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

      {/* MODAL ZA KREIRANJE / UREĐIVANJE PROIZVODA */}
      {isModalOpen && (
        <div className="animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md">
          <div className="animate-panel w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-2xl shadow-slate-950/20">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">
                {selectedProduct ? 'Uredi proizvod' : 'Novi proizvod'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {selectedProduct ? 'Ažurirajte podatke o artiklu.' : 'Dodajte novi artikal u katalog.'}
              </p>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="space-y-4 px-6 py-5">
                {formError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                    <AlertCircle className="mt-px h-4 w-4 shrink-0" />
                    <span className="leading-relaxed">{formError}</span>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Naziv proizvoda</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-slate-700">SKU Šifra</label>
                  <input
                    type="text"
                    required
                    value={formSKU}
                    onChange={(e) => setFormSKU(e.target.value)}
                    className={`${inputClasses} font-mono`}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Opis</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className={`${inputClasses} resize-none leading-relaxed`}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Cijena (KM)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className={`${inputClasses} tabular-nums`}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-slate-700">Količina na zalihi</label>
                    <input
                      type="number"
                      required
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className={`${inputClasses} tabular-nums`}
                    />
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
                  Sačuvaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
