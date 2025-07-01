
// Security utilities and configurations
export const SECURITY_CONFIG = {
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  
  // Password requirements
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_COMPLEXITY_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  
  // Session security
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  
  // Input validation
  MAX_INPUT_LENGTH: {
    NAME: 100,
    EMAIL: 254,
    PHONE: 20,
    ADDRESS: 200,
    DESCRIPTION: 1000,
    TITLE: 100,
  },
} as const;

// XSS Prevention
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Rate limiting helper
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const record = attempts.get(identifier);
    
    if (!record || now > record.resetTime) {
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  };
};

// HTTPS enforcement
export const enforceHTTPS = () => {
  if (typeof window !== 'undefined' && 
      window.location.protocol === 'http:' && 
      window.location.hostname !== 'localhost') {
    window.location.href = window.location.href.replace('http:', 'https:');
  }
};
