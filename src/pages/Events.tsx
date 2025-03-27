import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ChevronRight, X, Globe } from 'lucide-react';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { toast } from 'react-toastify';

type Event = Database['public']['Tables']['events']['Row'];

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
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
  };

  const getEventTypeIcon = (type: Event['type']) => {
    switch (type) {
      case 'online':
        return <Globe className="h-4 w-4" />;
      case 'hybrid':
        return <div className="flex space-x-1"><MapPin className="h-4 w-4" /><Globe className="h-4 w-4" /></div>;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-700 to-purple-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Upcoming Events</h1>
          <p className="text-xl text-purple-100">Join us in prayer and fellowship</p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
              <p className="mt-2 text-sm text-gray-500">Check back later for new events</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-48">
                    <img
                      src={event.image_url || 'default-event-image.jpg'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                      {event.type}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(event.start_time).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center text-gray-600">
                        {getEventTypeIcon(event.type)}
                        <span className="ml-2">{event.location}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedEvent.image_url || 'default-event-image.jpg'}
                alt={selectedEvent.title}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedEvent.title}
              </h2>
              <p className="text-gray-600">{selectedEvent.description}</p>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span>Date: {new Date(selectedEvent.start_time).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <span>Time: {`${new Date(selectedEvent.start_time).toLocaleTimeString()} - 
                    ${new Date(selectedEvent.end_time).toLocaleTimeString()}`}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  {getEventTypeIcon(selectedEvent.type)}
                  <span className="ml-3">Location: {selectedEvent.location}</span>
                </div>
                {selectedEvent.max_attendees && (
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3" />
                    <span>Capacity: {selectedEvent.max_attendees} attendees</span>
                  </div>
                )}
              </div>
              <div className="pt-6 border-t border-gray-200">
                <Link
                  to={`/register/${selectedEvent.id}`}
                  className="block w-full bg-purple-600 text-white text-center py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}