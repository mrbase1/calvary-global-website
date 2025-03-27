import React, { useState } from 'react';
import { toast } from 'react-toastify';

export function AdminSettings() {
  const [emailSettings, setEmailSettings] = useState({
    notifyOnPrayerRequest: true,
    notifyOnDonation: true,
    notifyOnEventRegistration: true
  });

  const [systemSettings, setSystemSettings] = useState({
    requireApproval: true,
    maxEventsPerDay: 3,
    maxPrayerRequestsPerUser: 5
  });

  const handleSave = () => {
    // Implement settings save logic here
    toast.success('Settings saved successfully');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">System Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Email Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Notify on new prayer request</span>
              <input
                type="checkbox"
                checked={emailSettings.notifyOnPrayerRequest}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  notifyOnPrayerRequest: e.target.checked
                })}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Notify on new donation</span>
              <input
                type="checkbox"
                checked={emailSettings.notifyOnDonation}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  notifyOnDonation: e.target.checked
                })}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Notify on event registration</span>
              <input
                type="checkbox"
                checked={emailSettings.notifyOnEventRegistration}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  notifyOnEventRegistration: e.target.checked
                })}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">System Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum events per day
              </label>
              <input
                type="number"
                value={systemSettings.maxEventsPerDay}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  maxEventsPerDay: parseInt(e.target.value)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max prayer requests per user
              </label>
              <input
                type="number"
                value={systemSettings.maxPrayerRequestsPerUser}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  maxPrayerRequestsPerUser: parseInt(e.target.value)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Require approval for registrations</span>
              <input
                type="checkbox"
                checked={systemSettings.requireApproval}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  requireApproval: e.target.checked
                })}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleSave}
          className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}