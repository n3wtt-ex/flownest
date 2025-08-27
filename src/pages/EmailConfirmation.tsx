import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function EmailConfirmation() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL parameters
        const params = new URLSearchParams(location.search);
        const token_hash = params.get('token_hash');
        const type = params.get('type');

        if (token_hash && type) {
          // Verify the token
          const { error } = await supabase.auth.verifyOtp({
            type: type as any,
            token_hash,
          });

          if (error) {
            setError('Failed to verify email. The link may have expired.');
          } else {
            setSuccess(true);
          }
        } else {
          setError('Invalid verification link.');
        }
      } catch (err) {
        setError('An unexpected error occurred during verification.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verifying your email
            </h2>
            <p className="mt-2 text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email Verified Successfully!
            </h2>
            <p className="mt-2 text-gray-600">
              Your email has been verified and your account is now active.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Proceed to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center">
              <XCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification Failed
          </h2>
          <p className="mt-2 text-gray-600">
            {error || 'Failed to verify your email address.'}
          </p>
          <div className="mt-6 space-y-4">
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Try Registration Again
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors ml-4"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailConfirmation;