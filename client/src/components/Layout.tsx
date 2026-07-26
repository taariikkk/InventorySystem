import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Package, ShoppingCart, LogOut, User, Users as UsersIcon } from 'lucide-react'; // Dodaj UsersIcon na kraj
export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Nakon logout-a, vraćamo korisnika na login
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      
      {/* SIDEBAR (Lijevi meni) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-wider">INVENTORY SYS</h1>
        </div>

        {/* Navigacijski linkovi */}
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link to="/products" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
            <Package className="h-5 w-5" />
            <span>Proizvodi</span>
          </Link>
          <Link to="/orders" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
            <ShoppingCart className="h-5 w-5" />
            <span>Narudžbe</span>
          </Link>
          <Link to="/orders" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition">
            <ShoppingCart className="h-5 w-5" />
            <span>Narudžbe</span>
          </Link>

          {/* OVO JE NOVI DIO: Link za korisnike se prikazuje SAMO Adminu */}
          {user?.role === 'Admin' && (
            <Link to="/users" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition text-red-400 hover:text-red-300">
              <UsersIcon className="h-5 w-5" />
              <span className="font-semibold">Korisnici (Admin)</span>
            </Link>
          )}
        </nav>

        {/* Korisnički profil na dnu sidebara */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-full">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold truncate max-w-[120px]">{user?.username}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
          
          {/* Logout dugme */}
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition"
            title="Odjavi se"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* GLAVNI SADRŽAJ (Desna strana) */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Sistem za upravljanje zalihama</h2>
          <span className="text-sm text-slate-500">Prijavljeni ste kao: <strong className="text-indigo-600">{user?.email}</strong></span>
        </header>

        {/* Ovdje se renderuju pojedinačne stranice (Dashboard, Proizvodi, Narudžbe) */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
};