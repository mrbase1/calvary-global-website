import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { toast } from 'react-toastify';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadEventImage } from '../../utils/storage';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['in_person', 'online', 'hybrid']),
  maxAttendees: z
    .number()
    .min(0, 'Must be 0 or greater')
    .nullable(),
  needsVolunteers: z.boolean(),
  imageUrl: z.string().nullable(),
  imageFile: z.any().optional(), // Add this for file upload
});

type EventFormData = z.infer<typeof eventSchema>;

type Event = Database['public']['Tables']['events']['Row'];
type EventRegistration = Database['public']['Tables']['event_registrations']['Row'] & {
  profiles: { full_name: string; email: string }
};

export function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [featuredEvents, setFeaturedEvents] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema)
  });

  useEffect(() => {
    fetchEvents();
    fetchFeaturedEvents();
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

  async function fetchFeaturedEvents() {
    const { data, error } = await supabase
      .from('featured_events')
      .select('event_id');
    
    if (error) {
      console.error('Error fetching featured events:', error);
      return;
    }
    
    setFeaturedEvents(data.map(fe => fe.event_id));
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Image must be less than 5MB');
        return;
      }

      const url = await uploadEventImage(file);
      setValue('imageUrl', url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    try {
      setSubmitting(true);
      console.log('Submitting event data:', data);

      // Check auth status before submitting
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to create events');
      }

      const { error } = await supabase
        .from('events')
        .insert({
          title: data.title,
          description: data.description,
          start_time: data.startTime,
          end_time: data.endTime,
          location: data.location,
          type: data.type,
          max_attendees: data.maxAttendees || null,
          needs_volunteers: data.needsVolunteers,
          image_url: data.imageUrl || null,
        });

      if (error) {
        console.error('Supabase error:', error);
        if (error.code === '42501') {
          throw new Error('You do not have permission to create events');
        }
        throw error;
      }

      toast.success('Event saved successfully');
      setShowForm(false);
      fetchEvents();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

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

  async function toggleFeatured(eventId: string) {
    try {
      const isFeatured = featuredEvents.includes(eventId);
      
      if (isFeatured) {
        // Remove from featured
        const { error } = await supabase
          .from('featured_events')
          .delete()
          .eq('event_id', eventId);
          
        if (error) throw error;
      } else {
        // Add to featured
        const { error } = await supabase
          .from('featured_events')
          .insert({ 
            event_id: eventId,
            created_by: null // Replace with actual user ID if available
          });
          
        if (error) throw error;
      }
      
      await fetchFeaturedEvents();
      toast.success(isFeatured ? 'Event removed from featured' : 'Event added to featured');
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status');
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
                    <button
                      onClick={() => toggleFeatured(event.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        featuredEvents.includes(event.id)
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {featuredEvents.includes(event.id) ? 'Featured' : 'Feature'}
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
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  {...register('title')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    {...register('startTime')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                  {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    {...register('endTime')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                  {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  {...register('location')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
                {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Event Type</label>
                <select
                  {...register('type')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="in_person">In Person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Maximum Attendees</label>
                <input
                  type="number"
                  min="0"
                  {...register('maxAttendees', {
                    setValueAs: (value: string) => (value === '' ? null : parseInt(value, 10))
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
                {errors.maxAttendees && <p className="text-red-500 text-sm">{errors.maxAttendees.message}</p>}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('needsVolunteers')}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label className="ml-2 text-sm text-gray-700">Needs Volunteers</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Event Image</label>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="event-image"
                  />
                  <label
                    htmlFor="event-image"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Choose Image
                  </label>
                  <input
                    type="hidden"
                    {...register('imageUrl')}
                  />
                  {watch('imageUrl') && (
                    <div className="relative w-20 h-20">
                      <img
                        src={watch('imageUrl') || undefined}
                        alt="Event preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => setValue('imageUrl', null)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                {errors.imageUrl && (
                  <p className="mt-1 text-sm text-red-500">{errors.imageUrl.message}</p>
                )}
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
                  disabled={submitting}
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