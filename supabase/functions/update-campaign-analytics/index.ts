// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js';

console.log("Hello from update-campaign-analytics Function!")

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '', // Use the new SERVICE_ROLE_KEY
      {
        global: {
          headers: { 'x-my-custom-header': 'update-campaign-analytics' },
        },
      }
    );

    const analyticsDataArray = await req.json();

    if (!Array.isArray(analyticsDataArray)) {
      return new Response(JSON.stringify({ error: 'Invalid payload: Expected an array of campaign analytics data.' }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const data of analyticsDataArray) {
      const {
        campaign_id,
        campaign_status,
        emails_sent_count,
        open_count,
        reply_count,
        link_click_count,
        total_opportunities,
        total_opportunity_value
      } = data;

      if (!campaign_id) {
        results.push({ campaign_id: 'N/A', status: 'failed', reason: 'Missing campaign_id' });
        continue;
      }

      // Map campaign_status number to string
      let statusString = 'paused'; // Default status
      switch (campaign_status) {
        case 1:
          statusString = 'draft';
          break;
        case 2:
          statusString = 'active';
          break;
        case 3:
          statusString = 'completed';
          break;
        case 4:
          statusString = 'paused';
          break;
        default:
          statusString = 'unknown';
      }

      // Calculate rates
      const openRate = emails_sent_count > 0 ? (open_count / emails_sent_count) * 100 : 0;
      const clickRate = emails_sent_count > 0 ? (link_click_count / emails_sent_count) * 100 : 0;
      const replyRate = emails_sent_count > 0 ? (reply_count / emails_sent_count) * 100 : 0;
      // Assuming positiveReplyRate is not directly provided, or needs a specific calculation
      // For now, we'll use a placeholder or derive if possible. If not, it will be 0 or needs clarification.
      const positiveReplyRate = reply_count > 0 ? (reply_count / reply_count) * 100 : 0; // Placeholder, needs actual logic if different

      const { data: updatedCampaign, error } = await supabaseClient
        .from('campaigns') // Assuming your table name is 'campaigns'
        .upsert({
          webhook_campaign_id: campaign_id, // Match by this unique ID for upsert
          name: data.campaign_name, // Include name for new inserts
          status: statusString,
          sent: emails_sent_count,
          clicks: link_click_count,
          replied: reply_count,
          open_rate: parseFloat(openRate.toFixed(1)), // Corrected to snake_case
          click_rate: parseFloat(clickRate.toFixed(1)), // Corrected to snake_case
          reply_rate: parseFloat(replyRate.toFixed(1)), // Corrected to snake_case
          positive_reply_rate: parseFloat(positiveReplyRate.toFixed(1)), // Corrected to snake_case
          opportunities: total_opportunities,
          revenue: total_opportunity_value,
          // progress: (emails_sent_count / total_leads_in_campaign) * 100, // Requires total_leads_in_campaign
        }, { onConflict: 'webhook_campaign_id' }) // Specify the conflict column for upsert
        .select();

      if (error) {
        console.error(`Error updating campaign ${campaign_id}:`, error.message);
        results.push({ campaign_id, status: 'failed', reason: error.message });
      } else {
        console.log(`Campaign ${campaign_id} updated successfully.`, updatedCampaign);
        results.push({ campaign_id, status: 'success', data: updatedCampaign });
      }
    }

    return new Response(
      JSON.stringify({ message: 'Campaign analytics updated successfully', results }),
      { headers: { "Content-Type": "application/json" } },
    );

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error processing webhook:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
