# Storeman Instant Estimate — production setup

The estimate UI, lead capture flow and `/api/lead` endpoint are built.

## Vercel environment variables

Add these in Vercel → Project Settings → Environment Variables:

- `RESEND_API_KEY` — required for automatic email notifications.
- `LEAD_NOTIFY_EMAIL` — where Storeman lead notifications are sent. Defaults to `hello@storeman.com.au`.
- `LEAD_FROM_EMAIL` — optional verified sender, e.g. `Storeman Website <quotes@storeman.com.au>`. Until a domain is verified in Resend, the API falls back to `Storeman Website <onboarding@resend.dev>`.
- `LEADS_WEBHOOK_URL` — optional. If supplied, every lead stage is also POSTed as JSON to this webhook for storage in a CRM, database, Google Sheet automation, etc.

After adding environment variables, redeploy the project.

## Lead events

The endpoint receives three stages:

1. `details_saved` — sent immediately when the customer enters contact/business/location details and clicks Save & Continue.
2. `estimate_completed` — sent after services/frequency are selected and the estimated range is calculated.
3. `site_visit_requested` — sent when the customer asks Storeman to contact them for a site visit.

The same lead ID is reused across all three stages.

## Estimate logic

The current pricing bands are deliberately broad because the website does not yet know site size, access, building area, condition or fleet size. They are configured in `estimate.js` under `SERVICE_BANDS` and can be tuned as Storeman gathers real job data.

Customers see one bundled range only. They do not see individual service prices.
