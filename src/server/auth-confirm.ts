import { createClient } from '@supabase/supabase-js';
import { type EmailOtpType } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function handleEmailConfirmation(request: Request) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = url.searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Redirect to success page
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${next}?message=Email+verified+successfully`,
        },
      });
    }
  }

  // Redirect to error page
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/auth/error?error=Invalid+or+expired+token`,
    },
  });
}