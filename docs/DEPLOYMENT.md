# EventSpark Deployment Guide

## Production Environment Variables

Ensure all the following environment variables are set in your Vercel Project Settings before deploying:

| Variable Name | Client/Server | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | The URL of your Supabase project (e.g. `https://xxx.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | The Supabase anonymous API key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Only | The Supabase service role key (bypass RLS for order writes). |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client & Server | Razorpay client key ID (e.g. `rzp_test_xxx`). |
| `RAZORPAY_KEY_ID` | Server Only | Razorpay backend key ID (matching client ID). |
| `RAZORPAY_KEY_SECRET` | Server Only | Razorpay secret key. |
| `RESEND_API_KEY` | Server Only | Resend API key for transaction emails. |

---

## Razorpay Webhook Configuration

After your Vercel deployment completes successfully, configure the Razorpay webhook to point to your new production domain:

1. Log in to the Razorpay Dashboard.
2. Go to **Settings** -> **Webhooks**.
3. Create a new webhook or update the existing one.
4. Set the Webhook URL to: `https://<your-production-domain>.vercel.app/api/webhooks/razorpay`
5. Enable the following events:
   - `payment.captured`
   - `payment.failed`
