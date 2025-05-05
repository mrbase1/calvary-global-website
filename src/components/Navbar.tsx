import React, { Fragment } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Heart, LogOut, User, Info, Calendar, Settings, Scale, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { supabase } from '../lib/supabase';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { useCart } from '../stores/cartStore';

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart();

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

  React.useEffect(() => {
    if (user) {
      useCart.getState().fetchCart();
    }
  }, [user]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isAdminOrPastor = React.useMemo(() => {
    return profile?.role === 'admin' || profile?.role === 'pastor';
  }, [profile?.role]);

  const userNavigation = [
    { name: 'Profile', href: '/dashboard', icon: User },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    ...(isAdminOrPastor ? [{ name: 'Admin', href: '/admin', icon: Settings }] : []),
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo and Title Section */}
          <div className="flex-shrink-0 flex items-center max-w-[40%] lg:max-w-[50%]">
            <Link to="/" className="flex items-center space-x-3">
              <Globe className="h-8 w-8 text-purple-600 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                Calvary Global Prayer & Healing Center
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6 ml-4 lg:ml-8">
            <Link
              to="/about"
              className={`flex items-center text-gray-700 hover:text-purple-600 whitespace-nowrap ${
                isActive('/about') ? 'text-purple-600' : ''
              }`}
            >
              <Info className="h-5 w-5 mr-1" />
              About
            </Link>
            <Link
              to="/events"
              className={`flex items-center text-gray-700 hover:text-purple-600 whitespace-nowrap ${
                isActive('/events') ? 'text-purple-600' : ''
              }`}
            >
              <Calendar className="h-5 w-5 mr-1" />
              Events
            </Link>
            <Link
              to="/prayer-requests"
              className={`flex items-center text-gray-700 hover:text-purple-600 whitespace-nowrap ${
                isActive('/prayer-requests') ? 'text-purple-600' : ''
              }`}
            >
              <Heart className="h-5 w-5 mr-1" />
              Prayer Requests
            </Link>
            <Link
              to="/legal"
              className={`flex items-center text-gray-700 hover:text-purple-600 whitespace-nowrap ${
                isActive('/legal') ? 'text-purple-600' : ''
              }`}
            >
              <Scale className="h-5 w-5 mr-1" />
              Legal
            </Link>
            <Link
              to="/shop"
              className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              <ShoppingBag className="h-5 w-5 inline-block mr-1" />
              Shop
            </Link>
            <Link
              to="/cart"
              className="text-gray-600 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium relative"
            >
              <ShoppingCart className="h-5 w-5 inline-block mr-1" />
              Cart
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            {user ? (
              <HeadlessMenu as="div" className="relative ml-3">
                <HeadlessMenu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    {user.email?.[0].toUpperCase()}
                  </div>
                </HeadlessMenu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <HeadlessMenu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {userNavigation.map((item) => (
                      <HeadlessMenu.Item key={item.name}>
                        {({ active }) => (
                          <Link
                            to={item.href}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } block px-4 py-2 text-sm text-gray-700`}
                          >
                            <div className="flex items-center">
                              <item.icon className="h-4 w-4 mr-2" />
                              {item.name}
                            </div>
                          </Link>
                        )}
                      </HeadlessMenu.Item>
                    ))}
                    <HeadlessMenu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleSignOut}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block w-full px-4 py-2 text-left text-sm text-gray-700`}
                        >
                          <div className="flex items-center">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </div>
                        </button>
                      )}
                    </HeadlessMenu.Item>
                  </HeadlessMenu.Items>
                </Transition>
              </HeadlessMenu>
            ) : (
              <Link
                to="/login"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
              >
                Sign In
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
            <Link
              to="/shop"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Shop
            </Link>
            <Link
              to="/cart"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600 relative"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            {user && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-700">{user.email}</div>
                  </div>
                </div>
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-600"
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}