import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';  // Add this import for date formatting
import { Database } from '../types/supabase';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/useAuth';

type Event = Database['public']['Tables']['events']['Row'];

export interface EventRegistrationModalProps {
  event: Event;
  onClose: () => void;
  onRegister: (registrationType: 'attendee' | 'volunteer') => void;
  isRegistered: boolean;
  isVolunteering: boolean;
}

export function EventRegistrationModal({ event, onClose }: EventRegistrationModalProps) {
  const { user } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isVolunteering, setIsVolunteering] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkRegistrationStatus = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setIsRegistered(data.registration_type === 'attendee');
        setIsVolunteering(data.registration_type === 'volunteer');
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    } finally {
      setLoading(false);
    }
  }, [event.id, user]);

  useEffect(() => {
    checkRegistrationStatus();
  }, [checkRegistrationStatus]);

  const handleRegister = async (type: 'attendee' | 'volunteer') => {
    if (!user) return;
    
    setRegistering(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: user.id,
          registration_type: type,
          status: 'pending'
        });

      if (error) throw error;

      setIsRegistered(type === 'attendee');
      setIsVolunteering(type === 'volunteer');
    } catch (error) {
      console.error('Error registering for event:', error);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
        
        <div className="space-y-4 mb-6">
          <p className="text-gray-600">{event.description}</p>
          
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span>
              {format(new Date(event.start_time), 'PPP')}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-2" />
            <span>
              {format(new Date(event.start_time), 'p')} - {format(new Date(event.end_time), 'p')}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{event.location}</span>
          </div>
          
          {event.max_attendees && (
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-2" />
              <span>Maximum {event.max_attendees} attendees</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : !isRegistered && !isVolunteering ? (
            <>
              <button
                onClick={() => handleRegister('attendee')}
                disabled={registering}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {registering ? 'Registering...' : 'Register to Attend'}
              </button>
              
              {event.needs_volunteers && (
                <button
                  onClick={() => handleRegister('volunteer')}
                  disabled={registering}
                  className="w-full border border-purple-600 text-purple-600 py-2 px-4 rounded-md hover:bg-purple-50 disabled:opacity-50"
                >
                  Volunteer for This Event
                </button>
              )}
            </>
          ) : (
            <p className="text-center text-green-600 font-medium">
              You are {isVolunteering ? 'volunteering for' : 'registered for'} this event
            </p>
          )}
        </div>
      </div>
    </div>
  );
}