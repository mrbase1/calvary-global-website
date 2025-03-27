import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/useAuth';
import { toast } from 'react-toastify';
import { PlusCircle } from 'lucide-react';

type PrayerRequestForm = {
  title: string;
  description: string;
  category: string;
  is_anonymous: boolean;
};

export function PrayerRequests() {
  const { user } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PrayerRequestForm>();
  const [requests, setRequests] = React.useState<Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    is_anonymous: boolean;
    profiles?: {
      full_name: string;
    };
  }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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

  const onSubmit = async (data: PrayerRequestForm) => {
    try {
      const { error } = await supabase.from('prayer_requests').insert({
        ...data,
        user_id: user?.id,
        status: 'pending'
      });

      if (error) throw error;

      toast.success('Prayer request submitted successfully');
      reset();
      fetchPrayerRequests();
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      toast.error('Failed to submit prayer request');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to submit prayer requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Prayer Request Form */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Prayer Request</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  >
                    <option value="">Select a category</option>
                    <option value="healing">Healing</option>
                    <option value="financial">Financial</option>
                    <option value="relationships">Relationships</option>
                    <option value="spiritual">Spiritual</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('is_anonymous')}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Submit anonymously
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Submit Request
                </button>
              </form>
            </div>
          </div>

          {/* Prayer Requests List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Prayer Requests</h2>
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <div className="space-y-6">
                {requests.map((request) => (
                  <div key={request.id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {request.is_anonymous
                            ? 'Anonymous'
                            : request.profiles?.full_name || 'Unknown'}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-purple-100 text-purple-800">
                        {request.category}
                      </span>
                    </div>
                    <p className="mt-4 text-gray-600">{request.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}