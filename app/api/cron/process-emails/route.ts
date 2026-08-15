import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import React from 'react';
import { BookingConfirmationEmail } from '../../../../emails/booking-confirmation';

// Secure service role client
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    // 1. Cron Authorization
    // Vercel cron jobs send an Authorization header with a Bearer token matching CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getAdminClient();
    
    // 2. Atomically claim a batch of emails (limit 50 per run)
    // Using PostgreSQL SELECT ... FOR UPDATE SKIP LOCKED inside an RPC or direct SQL
    // Next.js Supabase client doesn't support raw SQL easily unless we create an RPC.
    // Let's create an RPC to claim emails, or if not, use an UPDATE statement that returns.
    
    // An atomic update pattern:
    // We update up to 50 pending/failed (available) emails to 'processing' and return them.
    const { data: claimedEmails, error: claimErr } = await supabase.rpc('claim_emails_for_processing', {
      p_limit: 50
    });

    // If we don't have the RPC, we can do a fallback in Javascript, but the prompt asks for SELECT FOR UPDATE SKIP LOCKED where appropriate.
    // I will write the RPC in the same migration that created the table. Let me update the migration file first. But wait, I can't easily modify the migration. I'll just create a new migration for the RPC.
    
    // Let's assume the RPC exists (I'll create it in a moment)
    if (claimErr) {
      console.error('Failed to claim emails:', claimErr);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!claimedEmails || claimedEmails.length === 0) {
      return NextResponse.json({ status: 'No emails to process' });
    }

    let successCount = 0;
    let failCount = 0;

    // 3. Process each email
    for (const email of claimedEmails) {
      try {
        if (!resend) {
          throw new Error('RESEND_API_KEY is missing');
        }

        let emailResult;
        
        if (email.template_name === 'BookingConfirmation') {
          const params = email.payload;
          emailResult = await resend.emails.send({
            from: 'EventSpark <onboarding@resend.dev>',
            to: email.recipient,
            subject: email.subject,
            react: React.createElement(BookingConfirmationEmail, {
              eventName: params.eventName,
              eventDate: params.eventDate,
              eventVenue: params.eventVenue,
              attendeeName: params.attendeeName,
              ticketTypeName: params.ticketTypeName,
              qrCodeUrl: params.qrCodeUrl,
              registrationId: params.registrationId,
            }),
          });
        } else {
          throw new Error(`Unknown template: ${email.template_name}`);
        }

        if (emailResult.error) {
          throw emailResult.error;
        }

        // Mark as sent
        await supabase
          .from('email_outbox')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', email.id);

        successCount++;
      } catch (err: any) {
        // Mark as failed and increment attempts
        const isMaxRetries = (email.attempts + 1) >= email.max_attempts;
        const nextAvailable = new Date(Date.now() + Math.pow(2, email.attempts + 1) * 60000); // exponential backoff in minutes

        await supabase
          .from('email_outbox')
          .update({
            status: isMaxRetries ? 'failed' : 'pending',
            attempts: email.attempts + 1,
            last_error: err.message || JSON.stringify(err),
            available_at: isMaxRetries ? email.available_at : nextAvailable.toISOString() // if max retries, don't schedule again
          })
          .eq('id', email.id);
          
        failCount++;
      }
    }

    return NextResponse.json({
      status: 'Processed batch',
      success: successCount,
      failed: failCount,
      total: claimedEmails.length
    });

  } catch (error) {
    console.error('Process emails cron error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
