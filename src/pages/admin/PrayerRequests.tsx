import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { toast } from 'react-toastify';

type PrayerRequest = Database['public']['Tables']['prayer_requests']['Row'] & {
  profiles: { full_name: string }
};

export function AdminPrayerRequests() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  async function fetchPrayerRequests() {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
      toast.error('Failed to load prayer requests');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: 'pending' | 'in_progress' | 'completed') {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status } : req
      ));
      
      toast.success('Prayer request status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Prayer Requests</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.is_anonymous ? 'Anonymous' : request.profiles.full_name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{request.title}</div>
                    <div className="text-sm text-gray-500">{request.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                      {request.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={request.status}
                      onChange={(e) => updateStatus(request.id, e.target.value as 'pending' | 'in_progress' | 'completed')}
                      className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}