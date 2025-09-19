# Campaign Sync Implementation

## Overview

This implementation adds automatic synchronization of campaigns between the backend and the Campaigns page UI. It ensures that campaigns created by Instantly on other pages (without calling the Campaigns page webhook/UI flow) are reflected in the Campaigns page UI.

## Components

### 1. Backend Endpoint (`/api/campaigns/sync`)

Location: `supabase/functions/campaigns-sync/index.ts`

This Supabase Edge Function:
- Provides a GET endpoint at `/api/campaigns/sync`
- Authenticates users using their session token
- Fetches campaigns from the Supabase `campaigns` table
- Returns only minimal fields required by the UI:
  - `id` (campaign_id)
  - `name`
  - `status` (1 = active, 2 = paused)
  - `organization_id`
- Filters results by the current authenticated user's organization

### 2. Frontend Integration

Location: `src/pages/Campaigns.tsx`

The frontend implementation:
- Adds a `syncingCampaigns` state variable to track sync status
- Implements a `syncCampaigns` function that:
  - Calls the backend endpoint with proper authentication
  - Merges returned campaigns into the existing state without overwriting client-side fields
  - Adds new campaigns with minimal fields when they don't exist in the UI
  - Updates minimal UI fields if missing for existing campaigns
- Automatically syncs on page load
- Sets up a periodic sync interval (every 30 seconds)
- Shows a non-blocking "Syncing..." indicator during sync operations
- Properly cleans up the interval on component unmount

## Security

- Uses server-side Supabase service role key only on backend
- Derives organization_id from user JWT/session - never accepts org_id from client
- Requires proper user authentication for all operations

## Merge Logic

When syncing campaigns:
1. If a returned campaign does not exist in client state → append a new entry with only the minimal fields (id, name, status)
2. If a campaign exists in client state → do not overwrite client-side fields (progress, sent, clicks, replies, open_rate, click_rate, etc.)
3. Only update minimal UI fields if they are missing

## Error Handling

- Basic logging and error responses are provided
- Frontend shows non-blocking error indicators
- Server logs contain error details for debugging

## Testing

### Manual Test Checklist

1. Create a campaign via Instantly on a different page (without calling the Campaigns page webhook)
2. Open Campaigns page (or switch to it if already open) → confirm the new campaign appears in the list
3. Edit client-side-only fields on an existing campaign → trigger sync → verify the edited fields remain unchanged
4. Simulate a backend error → verify frontend shows a non-blocking error indicator and server logs contain the error

## Rollback Plan

Revert the endpoint PR and remove the frontend sync call. Because changes are additive and non-destructive, rollback should not cause data loss.