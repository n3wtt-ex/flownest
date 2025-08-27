import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { token_hash, type, next = '/' } = req.query;

  if (typeof token_hash !== 'string' || typeof type !== 'string') {
    return res.status(400).json({ error: 'Invalid token or type' });
  }

  try {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (error) {
      return res.redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }

    // Redirect to success page
    return res.redirect(`${next}?message=Email+verified+successfully`);
  } catch (error) {
    return res.redirect(`/auth/error?error=Unexpected+error+occurred`);
  }
}