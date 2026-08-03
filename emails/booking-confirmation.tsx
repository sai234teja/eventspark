import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BookingConfirmationEmailProps {
  eventName: string;
  eventDate: string;
  eventVenue: string;
  attendeeName: string;
  ticketTypeName: string;
  qrCodeUrl: string;
  registrationId: string;
}

export const BookingConfirmationEmail = ({
  eventName = 'Test Event',
  eventDate = 'TBA',
  eventVenue = 'TBA',
  attendeeName = 'Attendee Name',
  ticketTypeName = 'General Admission',
  qrCodeUrl = '',
  registrationId = '',
}: BookingConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your ticket for {eventName} is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logoText}>✨ EventSpark</Heading>
          </Section>
          
          <Section style={contentSection}>
            <Heading style={heading}>Booking Confirmed!</Heading>
            <Text style={text}>Hi {attendeeName},</Text>
            <Text style={text}>
              Your ticket for <strong>{eventName}</strong> is confirmed. Below are your ticket details and your digital entry pass.
            </Text>

            <Section style={ticketDetails}>
              <Text style={detailLabel}>EVENT</Text>
              <Text style={detailValue}>{eventName}</Text>

              <Text style={detailLabel}>DATE & TIME</Text>
              <Text style={detailValue}>{eventDate}</Text>

              <Text style={detailLabel}>VENUE</Text>
              <Text style={detailValue}>{eventVenue}</Text>

              <Text style={detailLabel}>TICKET TYPE</Text>
              <Text style={detailValue}>{ticketTypeName}</Text>

              <Text style={detailLabel}>REGISTRATION ID</Text>
              <Text style={detailValue}>{registrationId}</Text>
            </Section>

            {qrCodeUrl && (
              <Section style={qrSection}>
                <Text style={qrLabel}>YOUR ENTRY PASS</Text>
                <Img
                  src={qrCodeUrl}
                  width="180"
                  height="180"
                  alt="Entry Pass QR Code"
                  style={qrImage}
                />
                <Text style={qrSubtext}>Show this QR code at the venue entrance</Text>
              </Section>
            )}

            <Hr style={hr} />
            <Text style={footerText}>
              Need help? Contact the event organizer or reach out to EventSpark support.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingConfirmationEmail;

const main = {
  backgroundColor: '#0f172a',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  padding: '40px 0',
};

const container = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '16px',
  width: '560px',
  margin: '0 auto',
  overflow: 'hidden',
};

const logoSection = {
  backgroundColor: '#0f172a',
  padding: '24px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #334155',
};

const logoText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '800',
  margin: '0',
  letterSpacing: '-0.025em',
};

const contentSection = {
  padding: '40px 32px',
};

const heading = {
  color: '#22c55e',
  fontSize: '28px',
  fontWeight: '800',
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
};

const text = {
  color: '#94a3b8',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const ticketDetails = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const detailLabel = {
  color: '#64748b',
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px 0',
  letterSpacing: '0.05em',
};

const detailValue = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 16px 0',
};

const qrSection = {
  textAlign: 'center' as const,
  margin: '32px 0 24px 0',
};

const qrLabel = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 12px 0',
  letterSpacing: '0.05em',
};

const qrImage = {
  margin: '0 auto',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  padding: '8px',
};

const qrSubtext = {
  color: '#94a3b8',
  fontSize: '13px',
  marginTop: '12px',
  marginBottom: '0',
};

const hr = {
  borderColor: '#334155',
  margin: '32px 0 24px 0',
};

const footerText = {
  color: '#64748b',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
};
