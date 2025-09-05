import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface MockUser {
  id: string;
  email: string;
  created_at: string;
  app_metadata: {};
  user_metadata: {
    first_name?: string;
    last_name?: string;
  };
}

export interface MockSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  refresh_expires_in: number;
  token_type: string;
  user: MockUser;
}

export interface MockOrganization {
  id: string;
  name: string;
  slug: string;
  base_currency: string;
  created_at: string;
}

interface MockAuthProvider {
  user: MockUser | null;
  session: MockSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{error: any}>;
  signOut: () => Promise<void>;
  organizations: MockOrganization[];
}

const AuthContext = createContext<MockAuthProvider | undefined>(undefined);

// Mock data
const mockUser: MockUser = {
  id: 'mock-user-123',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {
    first_name: 'John',
    last_name: 'Doe'
  }
};

const mockSession: MockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  refresh_expires_in: 86400,
  token_type: 'bearer',
  user: mockUser
};

const mockOrganizations: MockOrganization[] = [
  {
    id: 'org-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    base_currency: 'USD',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'org-2',
    name: 'Global Industries Ltd',
    slug: 'global-industries',
    base_currency: 'EUR',
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'org-3',
    name: 'TechFlow Solutions',
    slug: 'techflow',
    base_currency: 'GBP',
    created_at: '2024-02-01T00:00:00Z'
  }
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [session, setSession] = useState<MockSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      // Check if user was previously logged in
      const storedUser = localStorage.getItem('mock-auth-user');
      const storedSession = localStorage.getItem('mock-auth-session');
      
      if (storedUser && storedSession) {
        setUser(JSON.parse(storedUser));
        setSession(JSON.parse(storedSession));
      }
      
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock authentication - only accepts test@example.com / testpass
    if (email === 'test@example.com' && password === 'testpass') {
      setUser(mockUser);
      setSession(mockSession);
      
      // Store in localStorage to persist across sessions
      localStorage.setItem('mock-auth-user', JSON.stringify(mockUser));
      localStorage.setItem('mock-auth-session', JSON.stringify(mockSession));
      
      return { error: null };
    } else {
      return { error: { message: 'Invalid email or password' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('mock-auth-user');
    localStorage.removeItem('mock-auth-session');
  };

  const value: MockAuthProvider = {
    user,
    session,
    loading,
    signIn,
    signOut,
    organizations: mockOrganizations,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};