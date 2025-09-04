import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check approval status if user is logged in
      if (session?.user) {
        checkUserApprovalStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check approval status if user is logged in
      if (session?.user) {
        checkUserApprovalStatus(session.user.id);
      } else {
        setApprovalStatus(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserApprovalStatus = async (userId: string) => {
    try {
      // Call the RPC function to get user approval status message
      const { data, error } = await supabase.rpc('get_user_approval_status_message', { user_uuid: userId });
      
      if (error) {
        console.error('Error checking user approval status:', error);
        setApprovalStatus(null);
      } else {
        setApprovalStatus(data);
      }
    } catch (error) {
      console.error('Error checking user approval status:', error);
      setApprovalStatus(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // If sign in is successful, check approval status
    if (data?.user && !error) {
      await checkUserApprovalStatus(data.user.id);
    }
    
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setApprovalStatus(null);
    return { error };
  };

  // Function to verify email with OTP token
  const verifyEmail = async (token: string, email: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      type: 'email',
      token,
      email: email,
    });
    return { data, error };
  };

  // Function to resend email verification
  const resendEmailVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    return { error };
  };

  return {
    user,
    loading,
    approvalStatus,
    signIn,
    signUp,
    signOut,
    verifyEmail,
    resendEmailVerification,
  };
}