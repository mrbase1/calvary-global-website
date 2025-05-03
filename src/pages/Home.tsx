import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, Clock, MapPin, Users, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/useAuth';
import cgphcImage from '../assets/cgphc-image.jpg';
import nationalDayImage from '../assets/national-day-of-prayer.jpg';
import comiImage1 from '../assets/comi-image.jpg';
import comiImage2 from '../assets/comi-image-2.jpg';
import comiImage3 from '../assets/comi-image-3.jpg';
import comiImage4 from '../assets/comi-image-4.jpg';
import comiImage5 from '../assets/comi-image-5.jpg';
import comiImage6 from '../assets/comi-image-6.jpg';
import comiImage7 from '../assets/comi-image-7.jpg';
import heroImage from '../assets/rev-keenam-4.jpg';
import dropPrayerImage from '../assets/drop-prayer-requests.jpg';
import { Footer } from '../components/Footer';


export function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user, profile } = useAuth();
  interface Event {
    id: string; // Add the 'id' property to the Event type
    title: string;
    description: string;
    start_time: string;
    image_url?: string;
    type?: string;
    location?: string;
    max_attendees?: number;
  }

  

  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  // Removed unused isRegistering state

  const handleEventClick = (e: React.MouseEvent, event: Event) => {
    e.preventDefault();
    setSelectedEvent(event);
  };

  // Add session monitoring
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('=== Homepage Session Check ===');
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
    };

    checkSession();
  }, [user, profile]);

  const fetchFeaturedEvents = async () => {
    const { data, error } = await supabase
      .from('featured_events')
      .select(`
        event_id,
        events (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured events:', error);
      return;
    }

    setFeaturedEvents(data.map(fe => fe.events).flat());
  };

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const images = [
    { src: comiImage1, alt: 'Prayer Meeting 1' },
    { src: comiImage2, alt: 'Prayer Meeting 2' },
    { src: comiImage3, alt: 'Prayer Meeting 3' },
    { src: comiImage4, alt: 'Prayer Meeting 4' },
    { src: comiImage5, alt: 'Prayer Meeting 5' },
    { src: comiImage6, alt: 'Prayer Meeting 6' },
    { src: comiImage7, alt: 'Prayer Meeting 7' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section 
        className="relative bg-cover bg-center bg-no-repeat h-[600px]" 
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-center w-full">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Welcome to <span className='text-purple-400'>Calvary Global Prayer & Healing Centre</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Join our community in prayer, worship, and fellowship
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                to="/events"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <Calendar className="mr-2 -ml-1 h-5 w-5" />
                View Events
              </Link>
              <Link
                to="/prayer-requests"
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:text-purple-600 transition-colors"
              >
                <Heart className="mr-2 -ml-1 h-5 w-5" />
                Prayer Requests
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white mx-auto">
                <svg 
                  className="h-6 w-6" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Community</h3>
              <p className="mt-2 text-base text-gray-500">
                Join a vibrant community of believers from around the world
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white mx-auto">
                <svg 
                  className="h-6 w-6" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Events</h3>
              <p className="mt-2 text-base text-gray-500">
                Participate in various spiritual and social events
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white mx-auto">
                <svg 
                  className="h-6 w-6" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Prayer</h3>
              <p className="mt-2 text-base text-gray-500">
                Share prayer requests and pray for others
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Prayer Network Section */}
      <section className="bg-white">
        <div className="py-8 lg:py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-gray-500 sm:text-lg">
              <h2 className="mb-4 text-4xl tracking-tight font-bold text-gray-900">
                A Prayer Network targeted at promoting the{' '}
                <span className="font-extrabold">peace, unity and progress</span>{' '}
                of Nations
              </h2>
              <p className="mb-4 font-light">
                Calvary Global Prayer and Healing Centre Nigeria is a Prayer
                network, comprising pastors, ordained ministers of the bible, and
                prayer-loving believers who converge to pray for the peace, unity,
                and progress of our dear nation Nigeria, going from city to city.
              </p>
              <p className="mb-4 font-medium">
                Supported by Calvary Global Outreach Ministries, USA, and convened
                by{' '}
                <Link
                  to="#"
                  className="text-base font-medium text-purple-600 hover:text-gray-600"
                >
                  Rev. Godswill Keenam
                </Link>
                .
              </p>
              <Link
                to="/about"
                className="inline-flex items-center font-medium text-purple-600 hover:text-purple-800 mr-16"
              >
                Learn more
                <svg
                  className="ml-1 w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                  to="/prayer-requests"
                  className="inline-flex items-center px-4 py-2 text-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Submit Prayer Request
                </Link>
            </div>
            <div className="relative h-[500px] rounded-lg overflow-hidden shadow-xl">
              <img
                src={dropPrayerImage}
                alt="Prayer Ministry"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      {featuredEvents.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Featured Events
            </h2>
            <div className={`grid ${
              featuredEvents.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            } gap-8`}>
              {featuredEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  onClick={(e) => handleEventClick(e, event)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {event.image_url && (
                    <div className="relative h-48">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                        {event.type}
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.start_time).toLocaleDateString()}
                    </div>
                    <p className="text-gray-600 line-clamp-2">{event.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden">
            <div className="relative">
              {selectedEvent.image_url && (
                <div className="w-full h-[400px] flex items-center justify-center bg-gray-100">
                  <img
                    src={selectedEvent.image_url}
                    alt={selectedEvent.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 shadow-md"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedEvent.title}
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  {new Date(selectedEvent.start_time).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  {new Date(selectedEvent.start_time).toLocaleTimeString()}
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    {selectedEvent.location}
                  </div>
                )}
                {selectedEvent.max_attendees && (
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    Max attendees: {selectedEvent.max_attendees}
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-6">{selectedEvent.description}</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                {user && (
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Register
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            <span className="text-gray-400"> Event Highlights:</span> 54th World Conference in USA
          </h2>
          <h4 className='text-center text-gray-600 mb-8'>
            View Photos from the
            54th World Conference held in the United States held in January this year.
          </h4>
          <h5 className='text-center text-gray-400'>click pics to enlarge</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image, index) => (
              <div 
                key={index} 
                className="cursor-pointer transform transition-transform hover:scale-105"
                onClick={() => setSelectedImage(image.src)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <button
                className="absolute top-4 right-4 text-white text-xl hover:text-purple-400"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="bg-purple-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Prayer Movement
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Together, we can make a difference through the power of prayer.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Donations Section */}
<section className="py-20 bg-gradient-to-r from-purple-50 to-indigo-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Partner With Us
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Support our mission to establish prayer networks and promote peace across nations. 
        Your generous donation will help us achieve our <Link to="/about" className="text-purple-600 hover:text-purple-800">strategic goals</Link>.
      </p>
    </div>
    
    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
      <div className="prose prose-purple max-w-none mb-8">
        <p className="text-gray-600 text-center">
          As the Spirit leads you, partner with us in this divine mandate through your generous donations. 
          Every contribution helps us extend our reach and impact more lives through prayer.
        </p>
      </div>
      
      <div className="flex justify-center">
        <Link
          to="/donate"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
        >
          Make a Donation
          <Heart className="ml-2 -mr-1 h-5 w-5" />
        </Link>
      </div>
    </div>
  </div>
</section>

      {/* National Day of Prayer */}
      <section className="bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg shadow-md py-10 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-content space-y-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-800">
              Pray For Nigeria!
            </h2>
            <p className="text-gray-700 text-base md:text-lg lg:text-xl">
              On the 31st of September every year, we hold the National Day of
              Prayer in Abuja and other states, as a precursor to Nigeria's
              Independence Day on 1st October.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 border-2 border-purple-200"
            >
              Get Started Today
            </Link>
          </div>
          <div className="image-content grid grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden shadow-md">
              <img
                src={cgphcImage}
                alt="Image 1"
                className="h-full object-cover"
              />
            </div>
            <div className="rounded-lg overflow-hidden shadow-md">
              <img
                src={nationalDayImage}
                alt="Image 2"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      
    </div>
  );
}
