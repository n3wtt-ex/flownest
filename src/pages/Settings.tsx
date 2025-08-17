import React from 'react';
import { useAuth } from '../hooks/useAuth';

export function Settings() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
        
        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                {user.user_metadata?.full_name || 'Not provided'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                {user.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 font-mono text-sm">
                {user.id}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Loading user information...</p>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Settings</h2>
        <p className="text-gray-600">Account settings options will be available here.</p>
      </div>
    </div>
  );
}
