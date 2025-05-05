import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Heart, 
  Mail, 
  DollarSign, 
  Users,
  Settings,
  ShoppingBag // Add this import
} from 'lucide-react';

export function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
        </div>
        <nav className="mt-4">
          <Link
            to="/admin"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Overview
          </Link>
          <Link
            to="/admin/events"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          >
            <Calendar className="h-5 w-5 mr-3" />
            Events
          </Link>
          <Link
            to="/admin/prayer-requests"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          >
            <Heart className="h-5 w-5 mr-3" />
            Prayer Requests
          </Link>
          <Link
            to="/admin/email"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          >
            <Mail className="h-5 w-5 mr-3" />
            Email Management
          </Link>
          <Link
            to="/admin/donations"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          >
            <DollarSign className="h-5 w-5 mr-3" />
            Donations
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          >
            <Users className="h-5 w-5 mr-3" />
            Users
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
          <Link
            to="/admin/shop"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700"
          >
            <ShoppingBag className="h-5 w-5 mr-3" />
            Shop Management
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}