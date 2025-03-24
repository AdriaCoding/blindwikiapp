import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import User from "@/models/user";
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  LoginCleanResponse,
  LogoutCleanResponse,
  RegisterCleanResponse,
} from "@/services/authService";
import { getSessionToken, saveSessionToken } from "@/services/secureStorage";

type AuthContextType = {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<LoginCleanResponse>;
  logout: () => Promise<LogoutCleanResponse>;
  register: (
    username: string,
    password: string,
    email: string
  ) => Promise<RegisterCleanResponse>;
  isLoggedIn: () => boolean;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Changed to false as we're not loading on init
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount - just check for session token
  useEffect(() => {
    const checkSessionToken = async () => {
      try {
        const token = await getSessionToken();
        if (token) {
          setSessionId(token);
          // Note: We can't load user data without an endpoint
          // The user will need to log in again to get their data
        }
      } catch (error) {
        console.error("Error checking session token:", error);
      }
    };

    checkSessionToken();
  }, []);

  // Function to clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Login function that wraps the API login
  const login = useCallback(
    async (username: string, password: string): Promise<LoginCleanResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        // Call the login API function from authService
        const response = await apiLogin(
          username,
          password,
          "41.38879",
          "2.15899"
        );

        // Update context state based on response
        if (response.success && response.user) {
          setUser(response.user);
          setSessionId(response.sessionId || null);
        } else if (!response.success) {
          setError(response.errorMessage || "Login failed");
        }

        return response;
      } catch (error) {
        console.error("Login error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        return {
          success: false,
          errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Logout function that wraps the API logout
  const logout = useCallback(async (): Promise<LogoutCleanResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the logout API function from authService
      const response = await apiLogout();

      // Always clear the auth state, even if the API call fails
      setUser(null);
      setSessionId(null);

      return response;
    } catch (error) {
      console.error("Logout error:", error);

      // Still clear the user state on error
      setUser(null);
      setSessionId(null);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      return {
        success: false,
        errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function that wraps the API register
  const register = useCallback(
    async (
      username: string,
      password: string,
      email: string
    ): Promise<RegisterCleanResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        // Get location from device or use default coordinates (Barcelona)
        const lat = "41.38879";
        const long = "2.15899";

        // Call the register API function
        const response = await apiRegister(
          username,
          password,
          email,
          lat,
          long
        );

        // Update context state based on response
        if (response.success && response.user) {
          setUser(response.user);
          setSessionId(response.sessionId || null);
        } else if (!response.success) {
          setError(response.errorMessage || "Registration failed");
        }

        return response;
      } catch (error) {
        console.error("Registration error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        return {
          success: false,
          errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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
    register,
    logout,
    isLoggedIn,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
