import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PrayerRequests } from './pages/PrayerRequests';
import { AuthProvider } from './contexts/AuthContext';
import { Events } from './pages/Events';
import { EventRegistration } from './pages/EventRegistration';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminOverview } from './pages/admin/Overview';
import { AdminPrayerRequests } from './pages/admin/PrayerRequests';
import { AdminEmail } from './pages/admin/Email';
import { AdminDonations } from './pages/admin/Donations';
import { AdminUsers } from './pages/admin/Users';
import { AdminSettings } from './pages/admin/Settings';
import { AdminEvents } from './pages/admin/Events';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { AdminBlog } from './pages/admin/Blog';
import { BlogEditor } from './pages/admin/BlogEditor';
import { AdminRoute } from './components/AdminRoute';
import { Legal } from './pages/Legal';
import { Donate } from './pages/Donate';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/prayer-requests" element={<PrayerRequests />} />
              <Route path="/events" element={<Events />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/register/:id" element={<EventRegistration />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              
              {/* Protect all admin routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />}>
                  <Route index element={<AdminOverview />} />
                  <Route path="events/*" element={<AdminEvents />} />
                  <Route path="prayer-requests/*" element={<AdminPrayerRequests />} />
                  <Route path="email/*" element={<AdminEmail />} />
                  <Route path="donations/*" element={<AdminDonations />} />
                  <Route path="users/*" element={<AdminUsers />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="blog/new" element={<BlogEditor />} />
                  <Route path="blog/edit/:id" element={<BlogEditor />} />
                </Route>
              </Route>
            </Routes>
            <ToastContainer position="bottom-right" />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;