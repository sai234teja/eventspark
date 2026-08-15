import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import Razorpay from 'razorpay';

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* Ignore inside Route Handler */ }
        },
      },
    }
  );
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user.id;
}

export async function POST(request: Request) {
  try {
    // SECURITY: Authenticate user from server-side session.
    // Never trust userId from the request body.
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
    }

    // 1. Verify Razorpay HMAC signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const bodyText = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. CRITICAL: Fetch the actual order amount from Razorpay server-side.
    // NEVER trust the amount from the request body — a client can manipulate it.
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    let verifiedAmountInRupees: number;
    try {
      const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
      if (!rzpOrder || rzpOrder.status !== 'paid') {
        return NextResponse.json({ error: 'Payment not confirmed by Razorpay' }, { status: 400 });
      }
      // Razorpay returns amounts in paise; convert to rupees
      verifiedAmountInRupees = (rzpOrder.amount_paid as number) / 100;
      if (verifiedAmountInRupees <= 0) {
        return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
      }
    } catch (rzpErr: any) {
      console.error('Razorpay order fetch error:', rzpErr);
      return NextResponse.json({ error: 'Failed to verify payment with Razorpay' }, { status: 502 });
    }

    const supabase = getAdminClient();

    // 3. Atomic wallet credit via secure RPC
    const { data: newBalance, error: rpcErr } = await supabase.rpc('credit_wallet_atomic', {
      p_user_id: userId,
      p_amount: verifiedAmountInRupees,
      p_provider_reference: razorpay_payment_id
    });

    if (rpcErr) {
      console.error('Wallet atomic credit error:', rpcErr);
      return NextResponse.json({ error: 'Failed to credit wallet' }, { status: 500 });
    }

    return NextResponse.json({ success: true, balance: newBalance });
  } catch (error: any) {
    console.error('Wallet Verify Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
