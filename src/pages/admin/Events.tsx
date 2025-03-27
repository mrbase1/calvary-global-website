import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { toast } from 'react-toastify';

type Event = Database['public']['Tables']['events']['Row'];
type EventRegistration = Database['public']['Tables']['event_registrations']['Row'] & {
  profiles: { full_name: string; email: string }
};

interface EventFormData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  type: 'in_person' | 'online' | 'hybrid';
  max_attendees: number | null;
  needs_volunteers: boolean;
  image_url: string | null;
}

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    type: 'in_person',
    max_attendees: null,
    needs_volunteers: false,
    image_url: null
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  async function fetchRegistrations(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const eventData = selectedEvent 
        ? { ...formData, id: selectedEvent.id }
        : formData;

      const { data, error } = await supabase
        .from('events')
        .upsert(eventData)
        .select()
        .single();

      if (error) throw error;

      setEvents(events.map(e => e.id === data.id ? data : e));
      setShowForm(false);
      setSelectedEvent(null);
      toast.success(`Event ${selectedEvent ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  }

  async function handleDelete(eventId: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.filter(e => e.id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  }

  async function updateRegistrationStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled') {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setRegistrations(registrations.map(reg => 
        reg.id === id ? { ...reg, status } : reg
      ));
      
      toast.success('Registration status updated');
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error('Failed to update registration');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Event Management</h1>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setFormData({
              title: '',
              description: '',
              start_time: '',
              end_time: '',
              location: '',
              type: 'in_person',
              max_attendees: null,
              needs_volunteers: false,
              image_url: null
            });
            setShowForm(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Event
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <div className="mt-2 space-y-2 text-sm text-gray-600">
                  <p>{new Date(event.start_time).toLocaleDateString()}</p>
                  <p>{event.location}</p>
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      fetchRegistrations(event.id);
                    }}
                    className="text-purple-600 hover:text-purple-700 flex items-center"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Registrations
                  </button>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setFormData(event);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedEvent ? 'Edit Event' : 'New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Event Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Event['type'] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="in_person">In Person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Attendees</label>
                <input
                  type="number"
                  value={formData.max_attendees || ''}
                  onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) || null })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.needs_volunteers}
                  onChange={(e) => setFormData({ ...formData, needs_volunteers: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label className="ml-2 text-sm text-gray-700">Needs Volunteers</label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  {selectedEvent ? 'Update' : 'Create'} Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registrations Modal */}
      {selectedEvent && registrations.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              Registrations for {selectedEvent.title}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {registration.profiles.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {registration.registration_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={registration.status}
                          onChange={(e) => updateRegistrationStatus(
                            registration.id,
                            e.target.value as EventRegistration['status']
                          )}
                          className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(registration.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}