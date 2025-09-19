// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js';

console.log("Hello from campaigns-sync Function!")

interface Campaign {
  id: string;
  name: string;
  status: number; // 1 = active, 2 = paused
  organization_id: string;
}

// Add this interface for the Supabase query result
interface DatabaseCampaign {
  id: string;
  name: string;
  status: string | number;
  organization_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }, null, 2), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    let userToken: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      userToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    // Create a Supabase client with service role key for server-side operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '', // Use service role key for server-side access
      {
        global: {
          headers: { 'x-my-custom-header': 'campaigns-sync' },
        },
      }
    );

    // If we have a user token, get the user's organization
    let organizationId: string | null = null;
    
    if (userToken) {
      // Get the user from the token
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(userToken);
      
      if (!userError && user) {
        // Get user's organization_id from user metadata or user_organizations table
        // First try to get from user metadata
        if (user.app_metadata?.organization_id) {
          organizationId = user.app_metadata.organization_id;
        } else {
          // If not in metadata, query the user_organizations table
          const { data: orgData, error: orgError } = await supabaseClient
            .from('user_organizations')
            .select('organization_id')
            .eq('user_id', user.id)
            .limit(1)
            .single();

          if (!orgError && orgData) {
            organizationId = orgData.organization_id;
          }
        }
      }
    }

    // If we still don't have an organization ID, return an error
    if (!organizationId) {
      return new Response(JSON.stringify({ error: 'User organization not found' }, null, 2), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch campaigns from the database
    const { data: campaigns, error } = await supabaseClient
      .from('campaigns')
      .select('id, name, status, organization_id')
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error.message);
      return new Response(JSON.stringify({ error: 'Failed to fetch campaigns', details: error.message }, null, 2), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform the data to match the expected format
    const payload: Campaign[] = campaigns.map((c: DatabaseCampaign) => ({
      id: c.id,
      name: c.name,
      status: typeof c.status === 'string' ? 
        (c.status === 'active' ? 1 : c.status === 'paused' ? 2 : 2) : 
        Number(c.status),
      organization_id: c.organization_id
    }));

    return new Response(
      JSON.stringify(payload, null, 2),
      { 
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        } 
      },
    );

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error processing campaign sync:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: errorMessage }, null, 2),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json" } 
      },
    );
  }
});