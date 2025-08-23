// Security utilities for input validation and sanitization

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeInput = (input: string, maxLength: number = 255): string => {
  return input.trim().substring(0, maxLength);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const sanitizeHtml = (input: string): string => {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const rateLimit = {
  // Client-side rate limiting helper
  isAllowed: (key: string, maxRequests: number = 5, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const windowKey = `${key}_${Math.floor(now / windowMs)}`;
    const requests = JSON.parse(localStorage.getItem(windowKey) || '0');
    
    if (requests >= maxRequests) {
      return false;
    }
    
    localStorage.setItem(windowKey, JSON.stringify(requests + 1));
    
    // Clean up old entries
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey?.startsWith(key) && storageKey !== windowKey) {
        localStorage.removeItem(storageKey);
      }
    }
    
    return true;
  }
};

export const logSecurityEvent = async (eventType: string, details: any = {}) => {
  try {
    // In a real app, this would send to your security monitoring service
    console.warn('[SECURITY EVENT]', eventType, details);
    
    // You could also send to Supabase audit log table
    // const { supabase } = await import('@/integrations/supabase/client');
    // await supabase.from('security_audit_log').insert({
    //   event_type: eventType,
    //   details,
    //   ip_address: 'client-side',
    //   user_agent: navigator.userAgent
    // });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};