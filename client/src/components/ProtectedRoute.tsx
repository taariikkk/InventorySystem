import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute: React.FC = () => {
  const { user } = useAuth();

  // Ako korisnik nije ulogovan, vraćamo ga na login stranicu
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Ako jeste ulogovan, dopuštamo pristup zaštićenim rutama kroz Outlet
  return <Outlet />;
};