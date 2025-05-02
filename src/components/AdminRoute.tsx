// import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export function AdminRoute() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Return loading state first
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Check auth and role
  const isAuthorized = user && profile && ['admin', 'pastor'].includes(profile.role);

  if (!isAuthorized) {
    // Redirect to login if not authenticated, or home if not authorized
    const redirectTo = user ? '/' : '/login';
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <Outlet />;
}