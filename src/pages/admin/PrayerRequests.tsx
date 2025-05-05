import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { Loader, CheckCircle, Clock, X } from 'lucide-react';

interface CompletionModalProps {
  isOpen: boolean;
  message: string;
  onMessageChange: (message: string) => void;
  onClose: () => void;
  onComplete: () => void;
}

const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  message,
  onMessageChange,
  onClose,
  onComplete
}) => (
  <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${
    !isOpen && 'hidden'
  }`}>
    <div className="bg-white rounded-lg max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Complete Prayer Request</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message for the requester
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          rows={4}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Share how you prayed for this request..."
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Cancel
        </button>
        <button
          onClick={onComplete}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
        >
          Complete Request
        </button>
      </div>
    </div>
  </div>
);

export function AdminPrayerRequests() {
  interface PrayerRequest {
    id: string; // Change from number to string
    title: string;
    description: string;
    category: string;
    status: string;
    is_anonymous: boolean;
    created_at: string;
    profiles: {
      full_name: string;
    }[] | null;
    user_id: string;
    completion_message?: string;
  }

  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);
  const [completionMessage, setCompletionMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadRequests = async () => {
      try {
        await fetchPrayerRequests();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadRequests();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchPrayerRequests = async () => {
    try {
      setLoading(true);
      console.log('[PrayerRequests] Starting fetch...');
      
      const { data: prayerRequests, error } = await supabase
        .from('prayer_requests')
        .select(`
          id,
          title,
          description,
          category,
          status,
          is_anonymous,
          created_at,
          user_id,
          profiles!prayer_requests_user_id_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the requests and handle anonymous ones
      const processedRequests = (prayerRequests || []).map(request => ({
        ...request,
        profiles: request.is_anonymous ? null : request.profiles
      }));
      
      setRequests(processedRequests);
    } catch (error) {
      console.error('[PrayerRequests] Error:', error);
      toast.error('Failed to load prayer requests');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: string, userId: string) => {
    try {
      console.log('[updateRequestStatus] Starting update with params:', {
        requestId,
        newStatus,
        userId,
        timestamp: new Date().toISOString()
      });

      // Add this right after the initial console.log
      console.log('[updateRequestStatus] Request ID type:', typeof requestId);
      console.log('[updateRequestStatus] Request ID value:', requestId);

      // First, verify the request exists and we have permission to update it
      const { data: checkData, error: checkError } = await supabase
        .from('prayer_requests')
        .select('id, status')
        .eq('id', requestId)
        .single();

      if (checkError) {
        console.error('[updateRequestStatus] Check error:', checkError);
        toast.error('Failed to verify prayer request');
        return;
      }

      if (!checkData) {
        console.error('[updateRequestStatus] Request not found:', requestId);
        toast.error('Prayer request not found');
        return;
      }

      console.log('[updateRequestStatus] Found request, current status:', checkData.status);
      
      // Now attempt the update
      const { data, error: updateError } = await supabase
        .from('prayer_requests')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select(`
          id,
          title,
          description,
          category,
          status,
          is_anonymous,
          created_at,
          user_id,
          profiles!prayer_requests_user_id_fkey (
            full_name
          )
        `)
        .single(); // Use single() since we're updating one record

      if (updateError) {
        console.error('[updateRequestStatus] Update error:', updateError);
        // Log more details about the error
        if (updateError.code === 'PGRST301') {
          console.error('[updateRequestStatus] Permission denied. Check RLS policies.');
        }
        throw updateError;
      }

      console.log('[updateRequestStatus] Update successful:', {
        id: data?.id,
        newStatus: data?.status,
        oldStatus: checkData.status
      });

      // Create notification only if update was successful and we have data
      if (data) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            prayer_request_id: requestId,
            message: `Your prayer request is now ${newStatus}. Our prayer team is attending to your request.`,
            created_at: new Date().toISOString()
          });

        if (notificationError) {
          console.error('[updateRequestStatus] Notification error:', notificationError);
          toast.warning('Status updated but notification could not be sent');
        } else {
          console.log('[updateRequestStatus] Notification sent successfully');
        }

        // Update local state
        setRequests(prevRequests => prevRequests.map(request => 
          request.id === requestId 
            ? {
                ...request,
                ...data,
                profiles: data.is_anonymous ? null : data.profiles
              }
            : request
        ));

        toast.success(`Prayer request marked as ${newStatus}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[updateRequestStatus] Critical error:', {
          error,
          message: error.message,
          stack: error.stack,
          requestId,
          newStatus
        });
        toast.error(`Failed to update prayer request status: ${error.message}`);
      } else {
        console.error('[updateRequestStatus] Unknown error:', error);
        toast.error('Failed to update prayer request status: Unknown error');
      }
      await fetchPrayerRequests(); // Refresh data on error
    }
  };

  const openCompletionModal = (request: PrayerRequest) => {
    setSelectedRequest(request);
    setCompletionMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setCompletionMessage('');
    setIsModalOpen(false);
  };

  const handleComplete = async () => {
    if (!selectedRequest || !completionMessage.trim()) {
      toast.error('Please enter a completion message');
      return;
    }

    try {
      // More detailed initial logging
      console.log('[handleComplete] Starting completion:', {
        requestId: selectedRequest.id,
        messageLength: completionMessage.length,
        timestamp: new Date().toISOString(),
        currentStatus: selectedRequest.status
      });

      // Verify request exists and get current status
      const { data: checkData, error: checkError } = await supabase
        .from('prayer_requests')
        .select('id, status, user_id')
        .eq('id', selectedRequest.id)
        .single();

      if (checkError) {
        console.error('[handleComplete] Check error:', checkError);
        toast.error('Failed to verify prayer request');
        return;
      }

      if (!checkData) {
        console.error('[handleComplete] Request not found:', selectedRequest.id);
        toast.error('Prayer request not found');
        return;
      }

      console.log('[handleComplete] Request verified, current status:', checkData.status);

      // Update the request
      const { data, error: updateError } = await supabase
        .from('prayer_requests')
        .update({ 
          status: 'completed',
          completion_message: completionMessage.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id)
        .select()
        .single();

      if (updateError) {
        console.error('[handleComplete] Update failed:', updateError);
        throw updateError;
      }

      if (!data) {
        console.error('[handleComplete] Update returned no data');
        toast.error('Failed to update prayer request');
        return;
      }

      console.log('[handleComplete] Update successful:', {
        id: data.id,
        newStatus: data.status,
        oldStatus: checkData.status
      });

      // Create notification after successful update
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: checkData.user_id, // Use the verified user_id from checkData
          prayer_request_id: selectedRequest.id,
          message: `Your prayer request has been completed. Message from the prayer team: ${completionMessage}`,
          created_at: new Date().toISOString()
        });

      if (notificationError) {
        console.error('[handleComplete] Notification error:', notificationError);
        toast.warning('Status updated but notification could not be sent');
      }

      // Update local state
      setRequests(prevRequests => prevRequests.map(request => 
        request.id === selectedRequest.id 
          ? {
              ...request,
              status: 'completed',
              completion_message: completionMessage.trim()
            }
          : request
      ));

      toast.success('Prayer request marked as completed');
      closeModal();

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('[handleComplete] Critical error:', {
          error,
          message: error.message,
          stack: error.stack,
          requestId: selectedRequest?.id
        });
        toast.error(`Failed to complete prayer request: ${error.message}`);
      } else {
        console.error('[handleComplete] Unknown error:', error);
        toast.error('Failed to complete prayer request: Unknown error');
      }
      await fetchPrayerRequests();
    }
  };

  console.log('[PrayerRequests] Render state:', { loading, requestCount: requests.length });

  if (loading) {
    console.log('[PrayerRequests] Showing loading spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Prayer Requests</h2>
      
      {requests.length === 0 ? (
        <p className="text-gray-600">No prayer requests found.</p>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    From: {!request.is_anonymous ? request.profiles?.[0]?.full_name || 'Unknown' : 'Anonymous'}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-sm px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                      {request.category}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      request.status === 'completed' 
                        ? 'bg-green-100 text-green-700'
                        : request.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {request.status !== 'completed' && (
                    <button
                      onClick={() => openCompletionModal(request)}
                      className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      title="Mark as completed"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  )}
                  {request.status === 'pending' && (
                    <button
                      onClick={() => updateRequestStatus(request.id, 'in_progress', request.user_id)}
                      className="p-2 text-yellow-600 hover:text-yellow-800 transition-colors"
                      title="Mark as in progress"
                    >
                      <Clock className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <span className="text-sm text-gray-500 ml-4">
                  {new Date(request.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
          ))}
        </div>
      )}
      <CompletionModal
        isOpen={isModalOpen}
        message={completionMessage}
        onMessageChange={setCompletionMessage}
        onClose={closeModal}
        onComplete={handleComplete}
      />
    </div>
  );
}

