import { Resend } from 'resend';
import { BookingConfirmationEmail } from '../../emails/booking-confirmation';
import React from 'react';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendBookingEmailParams {
  eventName: string;
  eventDate: string;
  eventVenue: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketTypeName: string;
  qrCodeUrl: string;
  registrationId: string;
}

export async function sendBookingConfirmationEmail(params: SendBookingEmailParams) {
  if (!resend) {
    console.warn('RESEND_API_KEY is not configured. Skipping email confirmation.');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'EventSpark <onboarding@resend.dev>',
      to: params.attendeeEmail,
      subject: `Your ticket for ${params.eventName} is confirmed!`,
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

    if (error) {
      console.error('Error sending confirmation email via Resend:', error);
    } else {
      console.log('Confirmation email sent successfully:', data?.id);
    }
  } catch (err) {
    console.error('Failed to send confirmation email:', err);
  }
}
