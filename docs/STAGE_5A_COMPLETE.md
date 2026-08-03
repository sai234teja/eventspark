# Stage 5A Complete: Ticket Booking Flow with Razorpay Payment

## Summary
Implemented the full end-to-end ticket booking flow: ticket discovery on event pages, booking form with attendee details, Razorpay payment integration with server-side signature verification, free ticket registration, QR code generation, and a booking success page.

## Files Created

### API Routes (Server-side only)
- **`app/api/orders/create/route.ts`**: `POST /api/orders/create`
  - Validates ticket availability (`quantity_total - quantity_sold >= requested`)
  - For FREE tickets: creates order (status=`paid`) + registration + QR code in one call, no Razorpay
  - For PAID tickets: creates a pending `orders` row, then creates a Razorpay order (amount in paise), returns `razorpayOrderId`, `keyId`, `amount`
  - Uses Supabase **service-role key** (bypasses RLS) for all DB writes
  
- **`app/api/orders/verify/route.ts`**: `POST /api/orders/verify`
  - **Signature verification is the FIRST thing checked** — `HMAC-SHA256(razorpay_order_id|razorpay_payment_id)` must match `razorpay_signature`
  - Returns `400` immediately if verification fails — DB is NOT touched
  - On success: updates `orders.status = 'paid'`, increments `ticket_types.quantity_sold`, generates QR code via `qrcode` library, inserts `registrations` row

### UI Components
- **`app/events/[slug]/TicketBookingWidget.tsx`**: Client component embedded in the event detail page
  - Shows all ticket types for the event with price, availability count, and sold-out state
  - Quantity selector (1–min(10, available))
  - "Log in to Book" if unauthenticated, "Register Free" if price=0, "Book Now" for paid
  - Routes to `/booking/[eventId]?ticketTypeId=...&quantity=...`

- **`app/events/[slug]/page.tsx`**: Updated to fetch `ticket_types` for the event and pass them to `TicketBookingWidget`

- **`app/booking/[eventId]/page.tsx`**: Booking confirmation page
  - Prefills attendee name and email from `profiles` table
  - Shows order summary (event, ticket type, quantity, total)
  - Calls `/api/orders/create`, then for paid tickets loads Razorpay checkout script dynamically
  - Handles payment success → calls `/api/orders/verify` → redirects to success
  - Handles payment dismissed → shows "Payment was cancelled" message

- **`app/booking/success/page.tsx`**: Confirmation page
  - Fetches registration by `registrationId` URL param
  - Shows QR code image, attendee info, event details, ticket type
  - "View My Tickets" → `/dashboard`, "Back to Events" → `/events`

## Security Notes
- Razorpay signature verification happens **before any DB mutation** in `/api/orders/verify`
- `RAZORPAY_KEY_SECRET` is server-only env var (never exposed to client)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is used only for opening the Razorpay modal
- Service role key used only in API routes — client code uses anon key with RLS

## Test Payment
Use Razorpay test card: `4111 1111 1111 1111`, any future expiry, any CVV

## Next Steps
Proceed to Stage 5B or Stage 6!
