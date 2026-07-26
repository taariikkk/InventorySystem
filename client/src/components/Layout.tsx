import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Package, ShoppingCart, LogOut, User, Users as UsersIcon, Boxes, Menu, X } from 'lucide-react'; // Dodaj UsersIcon na kraj

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  [
    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-slate-800/80 text-white shadow-sm ring-1 ring-white/10'
      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100',
  ].join(' ');

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobilna navigacija (drawer) - zatvorena po defaultu
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Zatvaramo drawer svaki put kada korisnik promijeni stranicu
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSidebarOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Sprečavamo skrolanje pozadine dok je mobilni meni otvoren
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login'); // Nakon logout-a, vraćamo korisnika na login
  };

  // Sadržaj sidebara je identičan na mobilnom i desktopu, pa ga dijelimo
  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20">
          <Boxes className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-semibold tracking-tight text-white">Inventory</h1>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">System</p>
        </div>

        {/* Dugme za zatvaranje - samo na mobilnom */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="ml-auto rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
          aria-label="Zatvori meni"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-5 h-px bg-slate-800/70" />

      {/* Navigacijski linkovi */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
          Pregled
        </p>

        <NavLink to="/" end className={navLinkClasses}>
          <LayoutDashboard className="h-[18px] w-[18px]" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/products" className={navLinkClasses}>
          <Package className="h-[18px] w-[18px]" />
          <span>Proizvodi</span>
        </NavLink>
        <NavLink to="/orders" className={navLinkClasses}>
          <ShoppingCart className="h-[18px] w-[18px]" />
          <span>Narudžbe</span>
        </NavLink>

        {/* OVO JE NOVI DIO: Link za korisnike se prikazuje SAMO Adminu */}
        {user?.role === 'Admin' && (
          <>
            <p className="px-3 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
              Administracija
            </p>
            <NavLink to="/users" className={navLinkClasses}>
              <UsersIcon className="h-[18px] w-[18px]" />
              <span>Korisnici</span>
              <span className="ml-auto rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
                Admin
              </span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Korisnički profil na dnu sidebara */}
      <div className="border-t border-slate-800/70 p-3">
        <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/70 p-2.5 ring-1 ring-inset ring-white/5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-white">{user?.username}</p>
              <p className="text-[11px] font-medium text-slate-500">{user?.role}</p>
            </div>
          </div>

          {/* Logout dugme */}
          <button
            onClick={handleLogout}
            className="shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-rose-400"
            title="Odjavi se"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50 font-sans">

      {/* SIDEBAR (Lijevi meni) - fiksan na desktopu */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800/60 bg-slate-950 md:flex">
        {sidebarContent}
      </aside>

      {/* MOBILNI SIDEBAR (Drawer + zatamnjena pozadina) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="animate-overlay absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Zatvori meni"
          />
          <aside className="animate-drawer absolute inset-y-0 left-0 flex w-[min(17rem,85vw)] flex-col border-r border-slate-800/60 bg-slate-950 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* GLAVNI SADRŽAJ (Desna strana) */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-3.5 backdrop-blur-xl sm:px-6 sm:py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            {/* Hamburger - otvara mobilni meni */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="-ml-1 shrink-0 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
              aria-label="Otvori meni"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-sm shadow-indigo-600/20 md:hidden">
              <Boxes className="h-4 w-4 text-white" />
            </div>
            <h2 className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-[15px]">
              <span className="hidden sm:inline">Sistem za upravljanje zalihama</span>
              <span className="sm:hidden">Zalihe</span>
            </h2>
          </div>
          <span className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 lg:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Prijavljeni kao</span>
            <strong className="max-w-[16ch] truncate font-semibold text-slate-800">{user?.email}</strong>
          </span>
          {/* Na mobilnom/tabletu prikazujemo samo avatar umjesto punog emaila */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold uppercase text-white lg:hidden">
            {user?.username?.charAt(0) ?? 'U'}
          </div>
        </header>

        {/* Ovdje se renderuju pojedinačne stranice (Dashboard, Proizvodi, Narudžbe) */}
        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <Outlet />
        </div>
      </main>

    </div>
  );
};
