import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import { toast } from 'react-toastify';

type Donation = Database['public']['Tables']['donations']['Row'] & {
  profiles: { full_name: string }
};

export function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  async function fetchDonations() {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled') {
    try {
      const { error } = await supabase
        .from('donations')
        .update({ 
          status,
          confirmed_at: status === 'confirmed' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;
      
      setDonations(donations.map(donation => 
        donation.id === id ? { 
          ...donation, 
          status,
          confirmed_at: status === 'confirmed' ? new Date().toISOString() : null
        } : donation
      ));
      
      toast.success('Donation status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Donations</h1>

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
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {donation.profiles.full_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: donation.currency
                    }).format(donation.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={donation.status}
                      onChange={(e) => updateStatus(donation.id, e.target.value as 'pending' | 'confirmed' | 'cancelled')}
                      className="rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {donation.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(donation.created_at).toLocaleDateString()}
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