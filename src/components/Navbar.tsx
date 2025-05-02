import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Heart, LogOut, User, Info, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { supabase } from '../lib/supabase';


export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false); // Close mobile menu if open
    } catch (error) {
      console.error('Error in handleSignOut:', error);
    }
    navigate('/');
  };

  // Add session check effect
  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('=== Session Status ===');
      console.log('Active Session:', !!session);
      console.log('Session Details:', {
        user: session?.user?.email,
        role: profile?.role,
        lastSignInAt: session?.user?.last_sign_in_at,
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'
      });
      console.log('Current User State:', {
        isAuthenticated: !!user,
        email: user?.email,
        profile: profile
      });
      
      if (!session && user) {
        signOut();
      }
    };
    
    checkSession();
  }, [user, profile]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Move this after the useEffect to ensure profile is loaded
  const isAdminOrPastor = React.useMemo(() => {
    return profile?.role === 'admin' || profile?.role === 'pastor';
  }, [profile?.role]);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <Globe className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">Calvary Global</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              to="/about"
              className={`flex items-center text-gray-700 hover:text-purple-600 ${
                isActive('/about') ? 'text-purple-600' : ''
              }`}
            >
              <Info className="h-5 w-5 mr-1" />
              About
            </Link>
            <Link
              to="/events"
              className={`flex items-center text-gray-700 hover:text-purple-600 ${
                isActive('/events') ? 'text-purple-600' : ''
              }`}
            >
              <Calendar className="h-5 w-5 mr-1" />
              Events
            </Link>
            <Link
              to="/prayer-requests"
              className={`flex items-center text-gray-700 hover:text-purple-600 ${
                isActive('/prayer-requests') ? 'text-purple-600' : ''
              }`}
            >
              <Heart className="h-5 w-5 mr-1" />
              Prayer Requests
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center text-gray-700 hover:text-purple-600 ${
                    isActive('/dashboard') ? 'text-purple-600' : ''
                  }`}
                >
                  <User className="h-5 w-5 mr-1" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-gray-700 hover:text-purple-600"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Sign In
              </Link>
            )}
            {isAdminOrPastor && (
              <Link
                to="/admin"
                className={`flex items-center text-gray-700 hover:text-purple-600 ${
                  location.pathname.startsWith('/admin') ? 'text-purple-600' : ''
                }`}
              >
                <Settings className="h-5 w-5 mr-1" />
                Admin
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/about"
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                isActive('/about')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              <Info className="h-5 w-5 mr-2" />
              About
            </Link>
            <Link
              to="/events"
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                isActive('/events')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Events
            </Link>
            <Link
              to="/prayer-requests"
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                isActive('/prayer-requests')
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              <Heart className="h-5 w-5 mr-2" />
              Prayer Requests
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/dashboard')
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  <User className="h-5 w-5 mr-2" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium bg-purple-600 text-white hover:bg-purple-700"
              >
                Sign In
              </Link>
            )}
            {isAdminOrPastor && (
              <Link
                to="/admin"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname.startsWith('/admin')
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                <Settings className="h-5 w-5 mr-2" />
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}