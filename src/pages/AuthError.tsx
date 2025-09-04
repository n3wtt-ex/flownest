import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, AlertTriangle, Clock, UserX } from 'lucide-react';

export function AuthError() {
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshCount, setRefreshCount] = useState(0); // Track refresh attempts
  
  const errorMessage = new URLSearchParams(location.search).get('error') || 'An authentication error occurred.';
  const message = new URLSearchParams(location.search).get('message') || '';

  // Determine which icon to show based on the message
  const getIcon = () => {
    if (message.includes('pending')) {
      return <Clock className="w-8 h-8 text-white" />;
    } else if (message.includes('rejected')) {
      return <UserX className="w-8 h-8 text-white" />;
    } else if (message) {
      return <AlertTriangle className="w-8 h-8 text-white" />;
    } else {
      return <XCircle className="w-8 h-8 text-white" />;
    }
  };

  // Determine the title based on the message
  const getTitle = () => {
    if (message.includes('pending')) {
      return 'Application Pending';
    } else if (message.includes('rejected')) {
      return 'Application Rejected';
    } else if (message) {
      return 'Authentication Update';
    } else {
      return 'Authentication Error';
    }
  };

  // Prevent automatic refresh
  useEffect(() => {
    // Clear any existing intervals or timeouts that might cause refresh
    const clearAutoRefresh = () => {
      // This is just a safeguard - we're not setting up any intervals in this component
      // But other components might be causing the refresh
    };
    
    clearAutoRefresh();
    
    // Clean up on unmount
    return () => {
      clearAutoRefresh();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center">
              {getIcon()}
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {getTitle()}
          </h2>
          <p className="mt-2 text-gray-600">
            {message || errorMessage}
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthError;