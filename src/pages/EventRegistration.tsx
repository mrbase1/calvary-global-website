import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { toast } from 'react-toastify';

type Event = Database['public']['Tables']['events']['Row'];
type EventRegistration = Database['public']['Tables']['event_registrations']['Insert'];

export function EventRegistration() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registrationType, setRegistrationType] = useState<'attendee' | 'volunteer'>('attendee');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnUrl: `/register/${id}` } });
      return;
    }

    const fetchEvent = async () => {
      try {
        const { data: event, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!event) throw new Error('Event not found');

        setEvent(event);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !event) return;

    setRegistering(true);

    try {
      // Check if user is already registered
      const { data: existingReg } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .single();

      if (existingReg) {
        toast.warning('You are already registered for this event');
        return;
      }

      // Create new registration
      const registration: EventRegistration = {
        event_id: id!,
        user_id: user.id,
        registration_type: registrationType,
        status: 'pending'
      };

      const { error } = await supabase
        .from('event_registrations')
        .insert(registration);

      if (error) throw error;

      toast.success('Successfully registered for the event!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Failed to register for the event');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <button
            onClick={() => navigate('/events')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            View All Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {event.image_url && (
              <div className="relative h-64">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h1 className="absolute bottom-6 left-6 text-3xl font-bold text-white">
                  {event.title}
                </h1>
              </div>
            )}

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>{new Date(event.start_time).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-3" />
                    <span>{`${new Date(event.start_time).toLocaleTimeString()} - 
                           ${new Date(event.end_time).toLocaleTimeString()}`}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3" />
                    <span>{event.location}</span>
                  </div>
                  {event.max_attendees && (
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-3" />
                      <span>{event.max_attendees} attendees max</span>
                    </div>
                  )}
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-4">
                    Registration Details
                  </h3>
                  <form onSubmit={handleRegister} className="space-y-4">
                    {event.needs_volunteers && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Registration Type
                        </label>
                        <select
                          value={registrationType}
                          onChange={(e) => setRegistrationType(e.target.value as 'attendee' | 'volunteer')}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                          <option value="attendee">Attendee</option>
                          <option value="volunteer">Volunteer</option>
                        </select>
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={registering}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {registering ? 'Registering...' : 'Confirm Registration'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Event Description
                </h2>
                <p className="text-gray-600">{event.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}