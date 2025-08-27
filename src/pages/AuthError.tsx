import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, AlertTriangle } from 'lucide-react';

export function AuthError() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const errorMessage = new URLSearchParams(location.search).get('error') || 'An authentication error occurred.';
  const message = new URLSearchParams(location.search).get('message') || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center">
              {message ? (
                <AlertTriangle className="w-8 h-8 text-white" />
              ) : (
                <XCircle className="w-8 h-8 text-white" />
              )}
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {message ? 'Authentication Update' : 'Authentication Error'}
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