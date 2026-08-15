import crypto from 'crypto';

/**
 * Returns the QR signing secret.
 * PRODUCTION SAFETY: Throws a hard error if QR_SIGNING_SECRET is not set.
 * A missing secret would make all QR codes forgeable — fail closed.
 */
const getSecret = (): string => {
  const secret = process.env.QR_SIGNING_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'QR_SIGNING_SECRET environment variable is not set or is too short (minimum 32 characters). ' +
      'QR ticket signing is disabled for security. Set this variable in your environment.'
    );
  }
  return secret;
};

export function signQrPayload(
  registrationId: string,
  eventId: string | number,
  userId: string
): string {
  const secret = getSecret();
  const payloadStr = `${registrationId}|${eventId}|${userId}`;
  const sig = crypto
    .createHmac('sha256', secret)
    .update(payloadStr)
    .digest('hex');

  return JSON.stringify({
    registrationId,
    eventId,
    userId,
    sig,
  });
}

export function verifyQrPayload(rawPayload: string): {
  valid: boolean;
  data?: { registrationId: string; eventId: any; userId: string };
} {
  try {
    const parsed = JSON.parse(rawPayload);
    const { registrationId, eventId, userId, sig } = parsed;

    if (!registrationId || eventId === undefined || !userId || !sig) {
      return { valid: false };
    }

    const secret = getSecret();
    const payloadStr = `${registrationId}|${eventId}|${userId}`;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payloadStr)
      .digest('hex');

    // timingSafeEqual requires buffers of identical length.
    const expectedBuffer = Buffer.from(expectedSig, 'utf8');
    const actualBuffer = Buffer.from(sig, 'utf8');

    if (expectedBuffer.length !== actualBuffer.length) {
      return { valid: false };
    }

    const isValid = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
    if (!isValid) {
      return { valid: false };
    }

    return {
      valid: true,
      data: { registrationId, eventId, userId },
    };
  } catch (err) {
    return { valid: false };
  }
}
