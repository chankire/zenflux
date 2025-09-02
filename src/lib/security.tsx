import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface SecurityContextType {
  sessionValid: boolean;
  checkSession: () => Promise<boolean>;
  logSecurityEvent: (eventType: string, details?: any) => Promise<void>;
  isSecureConnection: boolean;
  rateLimitStatus: {
    requests: number;
    resetTime: number;
  };
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionValid, setSessionValid] = useState(true);
  const [isSecureConnection, setIsSecureConnection] = useState(true);
  const [rateLimitStatus, setRateLimitStatus] = useState({
    requests: 0,
    resetTime: Date.now() + 60000 // Reset after 1 minute
  });

  // Check for secure connection
  useEffect(() => {
    setIsSecureConnection(
      window.location.protocol === 'https:' || 
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );

    if (!isSecureConnection && process.env.NODE_ENV === 'production') {
      toast({
        variant: "destructive",
        title: "Insecure Connection",
        description: "For your security, please use HTTPS to access this application.",
      });
    }
  }, [isSecureConnection, toast]);

  // Session validation
  const checkSession = async (): Promise<boolean> => {
    try {
      if (!user) return false;

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        setSessionValid(false);
        if (error) {
          console.error('Session validation error:', error);
          await logSecurityEvent('session_validation_failed', { error: error.message });
        }
        return false;
      }

      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < now) {
        setSessionValid(false);
        await logSecurityEvent('session_expired');
        return false;
      }

      setSessionValid(true);
      return true;
    } catch (error) {
      console.error('Session check failed:', error);
      setSessionValid(false);
      return false;
    }
  };

  // Security event logging
  const logSecurityEvent = async (eventType: string, details?: any) => {
    try {
      // Rate limiting for security events
      const now = Date.now();
      if (now > rateLimitStatus.resetTime) {
        setRateLimitStatus({ requests: 0, resetTime: now + 60000 });
      }

      if (rateLimitStatus.requests >= 10) {
        console.warn('Security event rate limit exceeded');
        return;
      }

      setRateLimitStatus(prev => ({ ...prev, requests: prev.requests + 1 }));

      const eventData = {
        event_type: eventType,
        user_id: user?.id,
        user_agent: navigator.userAgent,
        ip_address: 'client_side', // Backend will resolve actual IP
        timestamp: new Date().toISOString(),
        event_details: {
          ...details,
          url: window.location.href,
          referrer: document.referrer,
          secure_connection: isSecureConnection,
          session_valid: sessionValid
        }
      };

      // Temporarily disable security logging to avoid 404 errors
      console.log('Security Event:', eventType, eventData);
      
      // TODO: Re-enable when RPC/table is properly set up
      // try {
      //   await supabase.rpc('log_security_event', eventData);
      // } catch (rpcError) {
      //   console.warn('Security RPC logging failed:', rpcError);
      // }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  // Monitor for suspicious activity
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSession();
      }
    };

    const handleBeforeUnload = () => {
      if (user) {
        logSecurityEvent('session_ended', { reason: 'page_unload' });
      }
    };

    const handleFocus = () => {
      checkSession();
    };

    // Monitor for developer tools (basic detection)
    const detectDevTools = () => {
      if (process.env.NODE_ENV === 'production') {
        const threshold = 160;
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          logSecurityEvent('dev_tools_detected', {
            outer_dimensions: { width: window.outerWidth, height: window.outerHeight },
            inner_dimensions: { width: window.innerWidth, height: window.innerHeight }
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('resize', detectDevTools);

    // Periodic session validation
    const sessionCheckInterval = setInterval(checkSession, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('resize', detectDevTools);
      clearInterval(sessionCheckInterval);
    };
  }, [user]);

  // Log authentication events
  useEffect(() => {
    if (user) {
      logSecurityEvent('user_authenticated', {
        user_id: user.id,
        email: user.email,
        authentication_method: 'supabase_auth'
      });
    }
  }, [user]);

  const value = {
    sessionValid,
    checkSession,
    logSecurityEvent,
    isSecureConnection,
    rateLimitStatus,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

// Security utilities
export const validateFile = (file: File): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf'];
  const allowedExtensions = ['.csv', '.xls', '.xlsx', '.pdf', '.qif'];

  // Size validation
  if (file.size > maxSize) {
    errors.push(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 10MB limit`);
  }

  // Extension validation
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File type ${extension} is not allowed`);
  }

  // MIME type validation (if available)
  if (file.type && !allowedTypes.includes(file.type) && file.type !== '') {
    errors.push(`MIME type ${file.type} is not allowed`);
  }

  // Filename validation (prevent directory traversal)
  if (file.name.includes('../') || file.name.includes('..\\') || file.name.includes('/') || file.name.includes('\\')) {
    errors.push('Invalid filename characters detected');
  }

  // Check for suspicious filenames
  const suspiciousPatterns = [/\.exe$/, /\.bat$/, /\.cmd$/, /\.scr$/, /\.js$/, /\.vbs$/];
  if (suspiciousPatterns.some(pattern => pattern.test(file.name.toLowerCase()))) {
    errors.push('Suspicious file extension detected');
  }

  return { valid: errors.length === 0, errors };
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 1000); // Limit length
};

export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

// Rate limiting helper
let requestCounts: { [key: string]: { count: number; resetTime: number } } = {};

export const rateLimit = (key: string, maxRequests: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  
  if (!requestCounts[key] || now > requestCounts[key].resetTime) {
    requestCounts[key] = { count: 0, resetTime: now + windowMs };
  }
  
  if (requestCounts[key].count >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  requestCounts[key].count++;
  return true; // Request allowed
};

// Security event logging (standalone function)
export const logSecurityEvent = async (eventType: string, details?: any) => {
  try {
    const eventData = {
      event_type: eventType,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      event_details: {
        ...details,
        url: window.location.href,
        referrer: document.referrer
      }
    };

    await supabase
      .from('security_events')
      .insert(eventData);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};