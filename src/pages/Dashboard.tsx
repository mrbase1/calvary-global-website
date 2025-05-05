import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { User, Phone, Mail, Edit2, Save, X } from 'lucide-react';
import { EventCalendar } from '../components/EventCalendar';
import { EventRegistrationModal } from '../components/EventRegistrationModal';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];
type PrayerRequest = Database['public']['Tables']['prayer_requests']['Row'] & {
  completion_message?: string; };
type Event = Database['public']['Tables']['events']['Row'];
type EventRegistration = Database['public']['Tables']['event_registrations']['Row'];

const CompletionMessageModal: React.FC<{
  request: PrayerRequest | null;
  onClose: () => void;
}> = ({ request, onClose }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Prayer Team's Response</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-600 whitespace-pre-wrap">
          {request.completion_message || 'No message provided.'}
        </p>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedPrayerRequest, setSelectedPrayerRequest] = useState<PrayerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPrayerRequests();
      fetchEvents();
      fetchRegistrations();
    }
  }, [user]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setFormData({
        full_name: data.full_name,
        phone: data.phone || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  }

  async function fetchPrayerRequests() {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrayerRequests(data);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
      toast.error('Failed to load prayer requests');
    }
  }

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('end_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    }
  }

  async function fetchRegistrations() {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  }

  async function handleEventRegistration(registrationType: 'attendee' | 'volunteer') {
    if (!selectedEvent) return;

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: selectedEvent.id,
          user_id: user!.id,
          registration_type: registrationType,
        });

      if (error) throw error;
      toast.success(
        registrationType === 'volunteer'
          ? 'Successfully registered as a volunteer'
          : 'Successfully registered for the event'
      );
      fetchRegistrations();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for the event');
    }
  }

  const isRegisteredForEvent = (eventId: string) => {
    return registrations.some(
      (reg) => reg.event_id === eventId && reg.registration_type === 'attendee'
    );
  };

  const isVolunteeringForEvent = (eventId: string) => {
    return registrations.some(
      (reg) => reg.event_id === eventId && reg.registration_type === 'volunteer'
    );
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(false)}
                    className="text-gray-500 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{profile?.full_name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{profile.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Events Calendar */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
            <EventCalendar
              events={events}
              onEventClick={(event) => setSelectedEvent(event)}
            />
          </div>

          {/* Prayer Requests History */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Prayer Request History</h2>
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : prayerRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  You haven't submitted any prayer requests yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {prayerRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border-l-4 border-purple-500 pl-4 py-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                          <p className="mt-1 text-sm text-gray-600">{request.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {request.status === 'completed' && request.completion_message && (
                            <button
                              onClick={() => setSelectedPrayerRequest(request)}
                              className="px-2 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md"
                            >
                              View Message
                            </button>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${request.status === 'completed' ? 'bg-green-100 text-green-800' :
                              request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'}`}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{request.category}</span>
                        {request.is_anonymous && (
                          <>
                            <span>•</span>
                            <span>Anonymous</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedEvent && (
        <EventRegistrationModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleEventRegistration}
          isRegistered={isRegisteredForEvent(selectedEvent.id)}
          isVolunteering={isVolunteeringForEvent(selectedEvent.id)}
        />
      )}

      {selectedPrayerRequest && (
        <CompletionMessageModal
          request={selectedPrayerRequest}
          onClose={() => setSelectedPrayerRequest(null)}
        />
      )}
    </div>
  );
}