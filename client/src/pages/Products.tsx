import React, { useEffect, useState, useCallback } from 'react'; // Dodan useCallback
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { ProductResponse, PagedResponse, ProductRequest } from '../types';
import { Plus, Search, Trash2, Edit2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Upravljanje proizvodima</h1>
        
        {/* Kreiraj dugme se prikazuje SAMO Adminima i Managerima */}
        {isAllowedToEdit && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Novi proizvod</span>
          </button>
        )}
      </div>

      {/* FILTERI (Pretraga i Raspon cijena) */}
      <div className="grid grid-cols-1 gap-4 rounded-xl bg-white p-6 shadow-sm sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Pretraži po nazivu ili SKU..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Min cijena..."
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value !== '' ? Number(e.target.value) : ''); setPage(1); }}
            className="w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Max cijena..."
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value !== '' ? Number(e.target.value) : ''); setPage(1); }}
            className="w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
          />
        </div>
      </div>

      {/* TABELA PROIZVODA */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nema pronađenih proizvoda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
                  <th className="p-4">Naziv</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Cijena</th>
                  <th className="p-4">Zaliha</th>
                  {isAllowedToEdit && <th className="p-4 text-right">Akcije</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">{product.description}</div>
                    </td>
                    <td className="p-4 font-mono text-xs">{product.sku}</td>
                    <td className="p-4 font-semibold text-indigo-600">{Number(product.price).toFixed(2)} KM</td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        product.stockQuantity > 5 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {product.stockQuantity} kom
                      </span>
                    </td>
                    {isAllowedToEdit && (
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="inline-flex p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-indigo-600 transition"
                          title="Uredi"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="inline-flex p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600 transition"
                          title="Obriši"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINACIJA (Prethodna / Sljedeća) */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <span className="text-sm text-slate-500">
            Ukupno: <strong className="text-slate-800">{totalCount}</strong> proizvoda | Stranica <strong className="text-slate-800">{page}</strong> od <strong className="text-slate-800">{totalPages}</strong>
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

      {/* MODAL ZA KREIRANJE / UREĐIVANJE PROIZVODA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {selectedProduct ? 'Uredi proizvod' : 'Novi proizvod'}
            </h2>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Naziv proizvoda</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">SKU Šifra</label>
                <input
                  type="text"
                  required
                  value={formSKU}
                  onChange={(e) => setFormSKU(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Opis</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Cijena (KM)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Količina na zalihi</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
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