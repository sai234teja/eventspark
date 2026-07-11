'use server';

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client for server actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret',
});

const GST_RATE = 0.18;

export async function validateCoupon(couponCode: string, organizationId: string, eventId: number) {
  const { data: coupon, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('code', couponCode.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !coupon) return null;

  // Validate expiry
  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return null;
  }

  // Validate uses
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    return null;
  }

  // Validate event specific
  if (coupon.event_id && coupon.event_id !== eventId) {
    return null;
  }

  return coupon;
}

export async function createRazorpayOrderAction(
  eventId: number, 
  priceStr: string, 
  organizationId: string, 
  userId: string,
  couponCode?: string,
  affiliateCode?: string
) {
  try {
    let baseAmount = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
    let discountAmount = 0;
    
    // Process Coupon
    if (couponCode) {
      const coupon = await validateCoupon(couponCode, organizationId, eventId);
      if (coupon) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = baseAmount * (coupon.discount_value / 100);
        } else {
          discountAmount = coupon.discount_value;
        }
        baseAmount = Math.max(0, baseAmount - discountAmount);
      }
    }

    // Process GST
    const gstAmount = baseAmount * GST_RATE;
    const finalAmount = baseAmount + gstAmount;
    
    const amountInPaise = Math.round(finalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_evt_${eventId}_${Date.now()}`,
      notes: {
        eventId,
        organizationId,
        userId,
        couponCode: couponCode || null,
        affiliateCode: affiliateCode || null,
        baseAmount,
        gstAmount,
        discountAmount
      }
    };

    const order = await razorpay.orders.create(options);

    // Insert payment record
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        amount: finalAmount,
        currency: "INR",
        payment_status: 'pending',
        payment_provider: 'razorpay',
        razorpay_order_id: order.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting payment record:', error);
      throw new Error('Failed to initialize payment record in database');
    }

    return { 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency, 
      paymentRecordId: payment.id,
      breakdown: { baseAmount, gstAmount, discountAmount, finalAmount } 
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to create order: ${err.message}`);
    }
    throw new Error('Failed to create order');
  }
}

export async function verifyRazorpayPaymentAction(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  paymentRecordId: string,
  eventId: number,
  userId: string,
  organizationId: string
) {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'mock_key_secret';
    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    const { data: payment, error: paymentUpdateError } = await supabaseAdmin
      .from('payments')
      .update({
        payment_status: 'paid',
        razorpay_payment_id,
        razorpay_signature
      })
      .eq('id', paymentRecordId)
      .eq('payment_status', 'pending')
      .select()
      .single();

    if (paymentUpdateError || !payment) {
      throw new Error('Failed to update payment status or already processed');
    }

    return { success: true };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Verification failed: ${err.message}`);
    }
    throw new Error('Verification failed');
  }
}

export async function processRefundAction(paymentId: string, organizationId: string, amountToRefund?: number) {
  try {
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('organization_id', organizationId)
      .single();

    if (error || !payment || !payment.razorpay_payment_id) {
      throw new Error('Valid payment not found for refund');
    }

    const refundParams: any = {};
    if (amountToRefund) {
      refundParams.amount = Math.round(amountToRefund * 100);
    }

    const refund = await razorpay.payments.refund(payment.razorpay_payment_id, refundParams);

    const { error: refundInsertError } = await supabaseAdmin
      .from('refunds')
      .insert({
        organization_id: organizationId,
        payment_id: paymentId,
        razorpay_refund_id: refund.id,
        amount: amountToRefund || payment.amount,
        status: 'pending'
      });

    if (refundInsertError) {
      console.error('Failed to log refund in DB', refundInsertError);
    }

    return { success: true, refundId: refund.id };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Refund failed: ${err.message}`);
    }
    throw new Error('Refund failed');
  }
}
