import React, { useEffect, useState } from 'react';
import { Users, Calendar, Heart, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalPrayerRequests: number;
  totalDonations: number;
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalEvents: 0,
    totalPrayerRequests: 0,
    totalDonations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: usersCount },
          { count: eventsCount },
          { count: prayerRequestsCount },
          { count: donationsCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact' }),
          supabase.from('events').select('*', { count: 'exact' }),
          supabase.from('prayer_requests').select('*', { count: 'exact' }),
          supabase.from('donations').select('*', { count: 'exact' })
        ]);

        setStats({
          totalUsers: usersCount || 0,
          totalEvents: eventsCount || 0,
          totalPrayerRequests: prayerRequestsCount || 0,
          totalDonations: donationsCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Members', value: stats.totalUsers, icon: Users, color: 'blue' },
    { title: 'Active Events', value: stats.totalEvents, icon: Calendar, color: 'purple' },
    { title: 'Prayer Requests', value: stats.totalPrayerRequests, icon: Heart, color: 'red' },
    { title: 'Total Donations', value: stats.totalDonations, icon: DollarSign, color: 'green' }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard Overview</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className={`text-${stat.color}-500 mb-4`}>
                <stat.icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}