import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import crypto from 'crypto';

function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      userId,
      amount 
    } = await request.json();

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const bodyText = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Get user wallet
    const { data: wallet, error: walletErr } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', userId)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // Add transaction
    const txId = crypto.randomUUID();
    const { error: txErr } = await supabase.from('wallet_transactions').insert({
      id: txId,
      wallet_id: wallet.id,
      amount: amount,
      type: 'credit',
      description: 'Razorpay Wallet Top-up',
    });

    if (txErr) throw txErr;

    // Update balance
    const { error: updateErr } = await supabase
      .from('wallets')
      .update({ balance: wallet.balance + amount })
      .eq('id', wallet.id);

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true, balance: wallet.balance + amount });

  } catch (error: any) {
    console.error('Wallet Verify Error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
