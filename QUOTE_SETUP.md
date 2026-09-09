# Storeman Free Quote — production setup

The free quote UI, lead capture flow and `/api/lead` endpoint are built.

## Vercel environment variables

Add these in Vercel → Project Settings → Environment Variables:

- `RESEND_API_KEY` — required for automatic email notifications.
- `LEAD_NOTIFY_EMAIL` — where Storeman lead notifications are sent. Defaults to `hello@storeman.com.au`.
- `LEAD_FROM_EMAIL` — optional verified sender, e.g. `Storeman Website <quotes@storeman.com.au>`. Until a domain is verified in Resend, the API falls back to `Storeman Website <onboarding@resend.dev>`.
- `LEADS_WEBHOOK_URL` — optional. If supplied, every lead stage is also POSTed as JSON to this webhook for storage in a CRM, database, Google Sheet automation, etc.

After adding environment variables, redeploy the project.

## Lead events

The endpoint receives two stages:

1. `details_saved` — sent when the customer enters contact, business and location details and clicks Save & Continue.
2. `quote_requested` — sent after the customer selects services and frequency and submits the free quote request.

The same lead ID is reused across both stages.

When `quote_requested` is received, Storeman is emailed the customer details, selected services and frequency. The customer also receives a confirmation email explaining that Storeman will contact them to arrange a site visit and prepare an accurate quote.

There is no automated price estimate in the website flow.
