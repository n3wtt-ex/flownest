import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const checkingStatusRef = useRef(false); // Ref to prevent concurrent status checks
  const checkedStatusRef = useRef(false); // Ref to prevent repeated status checks

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check approval status if user is logged in and we haven't checked yet
      if (session?.user && !checkedStatusRef.current) {
        checkUserApprovalStatus(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check approval status if user is logged in and we haven't checked yet
      if (session?.user && !checkedStatusRef.current) {
        checkUserApprovalStatus(session.user.id);
      } else if (!session?.user) {
        setApprovalStatus(null);
        checkedStatusRef.current = false; // Reset when user logs out
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserApprovalStatus = async (userId: string) => {
    // Prevent concurrent status checks
    if (checkingStatusRef.current) {
      return;
    }
    
    // Prevent repeated status checks
    if (checkedStatusRef.current) {
      return;
    }
    
    checkingStatusRef.current = true;
    
    try {
      // First check if user is approved and active using the simpler function
      const { data: isApproved, error: approvalError } = await supabase.rpc('is_user_approved_and_active', { user_uuid: userId });
      
      if (approvalError) {
        // If the function doesn't exist or has an error, we assume the user is approved for backward compatibility
        if (approvalError.message.includes('Could not find the function') || approvalError.message.includes('function is_user_approved_and_active(uuid) does not exist')) {
          console.warn('User approval function not found, assuming user is approved for backward compatibility');
          setApprovalStatus('approved');
        } else {
          console.error('Error checking user approval status:', approvalError);
          // Still assume approved to prevent blocking existing users
          setApprovalStatus('approved');
        }
      } else {
        // If the user is approved and active, set status to approved
        // Otherwise, we need to check the specific status
        if (isApproved) {
          setApprovalStatus('approved');
          checkedStatusRef.current = true; // Mark as checked since user is approved
        } else {
          // Try to get the specific approval status message
          try {
            const { data: statusMessage, error: messageError } = await supabase.rpc('get_user_approval_status_message', { user_uuid: userId });
            
            if (messageError) {
              if (messageError.message.includes('Could not find the function')) {
                console.warn('User approval status message function not found, assuming user is approved');
                setApprovalStatus('approved');
              } else {
                console.error('Error getting user approval status message:', messageError);
                // Default to approved to prevent blocking existing users
                setApprovalStatus('approved');
              }
            } else {
              setApprovalStatus(statusMessage);
              checkedStatusRef.current = true; // Mark as checked
            }
          } catch (messageError) {
            console.error('Error getting user approval status message:', messageError);
            // Default to approved to prevent blocking existing users
            setApprovalStatus('approved');
            checkedStatusRef.current = true; // Mark as checked
          }
        }
      }
    } catch (error) {
      console.error('Error checking user approval status:', error);
      // Default to approved to prevent blocking existing users
      setApprovalStatus('approved');
      checkedStatusRef.current = true; // Mark as checked
    } finally {
      checkingStatusRef.current = false;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // If sign in is successful, check approval status
    if (data?.user && !error) {
      checkedStatusRef.current = false; // Reset the check status for new sign in
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
    setUser(null);
    setApprovalStatus(null);
    checkedStatusRef.current = false; // Reset when user logs out
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