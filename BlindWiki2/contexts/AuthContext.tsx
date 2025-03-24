import { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import User from '@/models/user';
import { 
  login as apiLogin, 
  logout as apiLogout, 
  fetchUserProfile,
  LoginCleanResponse,
  LogoutCleanResponse 
} from '@/services/authService';
import { getSessionToken } from '@/services/secureStorage';

type AuthContextType = {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<LoginCleanResponse>;
  logout: () => Promise<LogoutCleanResponse>;
  isLoggedIn: () => boolean;
  refreshUserProfile: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = await getSessionToken();
        
        if (token) {
          setSessionId(token);
          const profileResponse = await fetchUserProfile();
          
          if (profileResponse.success && profileResponse.user) {
            setUser(profileResponse.user);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Refresh user profile function
  const refreshUserProfile = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchUserProfile();
      
      if (response.success && response.user) {
        setUser(response.user);
        return true;
      } else {
        setError(response.errorMessage || 'Failed to load user profile');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function that wraps the API login
  const login = useCallback(async (username: string, password: string): Promise<LoginCleanResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the login API function from authService
      const response = await apiLogin(username, password, "41.38879", "2.15899");
      
      // Update context state based on response
      if (response.success && response.user) {
        setUser(response.user);
        setSessionId(response.sessionId || null);
      } else if (!response.success) {
        setError(response.errorMessage || 'Login failed');
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function that wraps the API logout
  const logout = useCallback(async (): Promise<LogoutCleanResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the logout API function from authService
      const response = await apiLogout();
      
      // Always clear the auth state, even if the API call fails
      if (response.success) {
        setUser(null);
        setSessionId(null);
      } else {
        setError(response.errorMessage || 'Logout failed');
      }
      
      // Always clear state even if API fails
      setUser(null);
      setSessionId(null);
      
      return response;
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still clear the user state on error
      setUser(null);
      setSessionId(null);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to check login status
  const isLoggedIn = useCallback((): boolean => {
    return user !== null;
  }, [user]);

  const contextValue: AuthContextType = {
    user,
    sessionId,
    isLoading,
    error,
    login,
    logout,
    isLoggedIn,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}