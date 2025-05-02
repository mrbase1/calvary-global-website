import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Globe, Book, Heart } from 'lucide-react';
import { Footer } from '../components/Footer';
import eventFlyer1 from '../assets/event-flyer.jpg';
import eventFlyer2 from '../assets/event-flyer-2.jpg';
import eventFlyer3 from '../assets/event-flyer-3.jpg';
import eventFlyer4 from '../assets/event-flyer-4.jpg';
import revKeenamImage from '../assets/rev-keenam-us-flag.jpg';
import { ChevronRight, Target, Crosshair, Focus } from 'lucide-react';
import { motion } from 'framer-motion';

export function About() {
    const [selectedEventImage, setSelectedEventImage] = useState<string | null>(null);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-32"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About Calvary Global Prayer & Healing Center
          </h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Dedicated to fostering spiritual growth and unity through prayer across nations
          </p>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              <p className="text-lg text-gray-600">
                To unite believers across nations in prayer, fostering spiritual growth,
                peace, and healing through the power of collective intercession and faith
                in Jesus Christ.
              </p>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              <p className="text-lg text-gray-600">
                To become a global catalyst for spiritual transformation, creating a
                network of prayer warriors dedicated to bringing positive change to
                communities worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Goals Section */}
      <section className="py-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50"
          style={{
            clipPath: 'polygon(0 0, 100% 5%, 100% 100%, 0 95%)'
          }}
        />
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Strategic Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Prayer Leadership & Support',
                items: [
                  'Serve, strengthen and encourage intercessors and prayer leaders to prayer for their pastors, communities, City and Nation',
                  'Recruit intercessors to pray in their local government City Hall for God\'s wisdom and guidance',
                  'Provide up-to-the-minute information to prayer warriors concerning prayer worldwide',
                  'Encourage and equip prayer leaders to become spiritual "terrorists" against all works of the devil'
                ]
              },
              {
                title: 'Network & Training',
                items: [
                  'Expand networking to increase prayer leaders praying for city, state, Africa and global transformation',
                  'Provide intercessory instruction through annual prophetic school of prayer and intercession',
                  'Maintain sophisticated website for prayer movement in Africa, USA and other Nations',
                  'Implement creative momentum training to stimulate the prayer movement'
                ]
              },
              {
                title: 'City Transformation',
                items: [
                  'Saturate the city with prayer for revival and completion of the great commission',
                  'Monitor progress and publicize ongoing works of God in our city',
                  'Support local government through targeted prayer initiatives',
                  'Foster unity among city churches through collective prayer efforts'
                ]
              }
            ].map((goal, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-6">{goal.title}</h3>
                <ul className="space-y-4">
                  {goal.items.map((item, i) => (
                    <li key={i} className="flex items-start text-gray-600">
                      <ChevronRight className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span className="ml-2">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Objectives Section */}
      <section className="py-20 bg-gradient-to-b from-white to-purple-50">
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Our Objectives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                icon: <Target className="h-8 w-8" />,
                title: 'Immediate Focus',
                items: [
                  'Cover our city, state and nation with strong focused intercession',
                  'Wage spiritual war on behalf of Africa and America, tearing down Satan\'s strongholds',
                  'Network with churches throughout Africa and America to raise up intercessors',
                  'Be a strength to local churches',
                  'Establish a 24/7 prayer Helpline with trained, anointed volunteer prayer ministers'
                ]
              },
              {
                icon: <Crosshair className="h-8 w-8" />,
                title: 'Long-term Vision',
                items: [
                  'Discover and pursue God\'s divine Will for our generation',
                  'Release waves of salvation, healing and deliverance in Jesus\' Name',
                  'Spiritually shake Nations and the world for Jesus',
                  'Partner with ministries for education and healthcare initiatives',
                  'Establish clean water projects and schools while building global relationships'
                ]
              }
            ].map((objective, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl transform -rotate-1 group-hover:rotate-1 transition-transform" />
                <div className="relative bg-white rounded-2xl p-8 shadow-lg">
                  <div className="text-purple-500 mb-6">{objective.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {objective.title}
                  </h3>
                  <ul className="space-y-4">
                    {objective.items.map((item, i) => (
                      <li key={i} className="flex items-start text-gray-600">
                        <div className="h-2 w-2 bg-purple-500 rounded-full mr-3 mt-2" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Focus Areas Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-gray-900 to-purple-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-center mb-16">
            Focus Areas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Prayer Mobilization', description: 'Organizing and coordinating global prayer initiatives' },
              { title: 'Leadership Development', description: 'Training and equipping prayer leaders worldwide' },
              { title: 'Community Transformation', description: 'Impacting communities through targeted prayer programs' },
              { title: 'Resource Creation', description: 'Developing comprehensive prayer and training materials' }
            ].map((focus, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Focus className="h-8 w-8 text-purple-300 mb-4" />
                <h3 className="text-xl font-semibold mb-3">{focus.title}</h3>
                <p className="text-purple-100">{focus.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Faith</h3>
              <p className="text-gray-600">
                Unwavering belief in the power of prayer and God's faithfulness
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Unity</h3>
              <p className="text-gray-600">
                Breaking denominational barriers through collective prayer
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Impact</h3>
              <p className="text-gray-600">
                Reaching across borders to affect positive change
              </p>
            </div>
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
                <Book className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Biblical Foundation</h3>
              <p className="text-gray-600">
                Grounded in scripture and sound doctrine
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section 
        className="py-16 relative overflow-hidden"
        style={{
          background: `linear-gradient(120deg, rgba(139, 92, 246, 0.05) 0%, rgba(91, 33, 182, 0.1) 100%)`,
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Decorative pattern overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B5CF6' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundAttachment: 'fixed'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Leadership
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <img
                src={revKeenamImage}
                alt="Rev. Godswill Keenam"
                className="w-48 h-48 object-cover rounded-full mx-auto shadow-xl mb-6 border-4 border-white"
              />
            </div>
            <div className="space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900">
                Rev. Godswill Keenam
              </h3>
              <p className="text-lg text-gray-600">
                Founder & Convener of CGPHC
              </p>
              <p className="text-gray-600 max-w-2xl mx-auto">
                With over two decades of ministry experience, Rev. Godswill Keenam has led
                the charge in establishing a global prayer movement that transcends
                denominational and national boundaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Past Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Past Events</h2>
              <p className="text-lg text-gray-600">
                Over the years, CGPHC has organized numerous impactful prayer gatherings
                and conferences that have touched lives across nations. Our events bring
                together believers from different denominations, fostering unity and
                spiritual growth.
              </p>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                  <span>Annual Prayer Summit - Lagos, Nigeria</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                  <span>Global Prayer Conference - Houston, USA</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                  <span>Youth Prayer Revival - Port Harcourt, Nigeria</span>
                </li>
              </ul>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-4">
              {[eventFlyer1, eventFlyer2, eventFlyer3, eventFlyer4].map((image, index) => (
                <div
                  key={index}
                  className="cursor-pointer overflow-hidden rounded-lg shadow-md transition-transform hover:scale-105"
                  onClick={() => setSelectedEventImage(image)}
                >
                  <img
                    src={image}
                    alt={`Event ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Images Lightbox */}
        {selectedEventImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEventImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <button
                className="absolute top-4 right-4 text-white text-xl hover:text-purple-400"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEventImage(null);
                }}
              >
                ×
              </button>
              <img
                src={selectedEventImage}
                alt="Enlarged event"
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
            Join Our Global Prayer Movement
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Be part of a community dedicated to transforming nations through prayer
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50"
          >
            Become a Member
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}