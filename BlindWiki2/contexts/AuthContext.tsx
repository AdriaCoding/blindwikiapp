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
  RegisterCleanResponse,
} from "@/services/authService";
import { CleanResponse } from "@/services/api";
import { 
  getSessionToken, 
  getCredentials, 
  saveCredentials, 
  removeCredentials,
} from "@/services/secureStorage";

type AuthContextType = {
  user: User | null;
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<LoginCleanResponse>;
  logout: () => Promise<CleanResponse>;
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
  const [isLoading, setIsLoading] = useState(true); // Start as true while checking auto-login 
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state and attempt auto-login
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have stored credentials
        const credentials = await getCredentials();
        if (credentials) {
          // Attempt to login with stored credentials
          await login(credentials.username, credentials.password);
          return; // login() will set isLoading=false when done
        }
        console.log("👤 No stored credentials found, entering guest mode.");
        // If we get here, no auto-login was attempted or it failed
        // Just check for an existing session token
        const token = await getSessionToken();
        if (token) {
          setSessionId(token);
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
      } finally {
        // Whether login succeeded or not, we're done loading
        setIsLoading(false);
      }
    };

    initAuth();
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
          console.log("👤 Logged with username:", response.user.username);
          setSessionId(response.sessionId || null);
          // Always store credentials for auto-login on successful login
          await saveCredentials(username, password);

        } else if (!response.success && response.errorMessage === "Incorrect username or password.") {
          console.log("🔐Credential error from authcontext", response);
          return response;
        }

        setError(response.errorMessage || "Login failed");
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
  const logout = useCallback(async (): Promise<CleanResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the logout API function from authService
      const response = await apiLogout();

      // Always clear the auth state, even if the API call fails
      setUser(null);
      setSessionId(null);
      
      // Always remove credentials on logout
      await removeCredentials();

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
        // Note: Unlike login, registration doesn't necessarily result in an active user
        // since the user might need to confirm their email first
        if (response.success && response.user) {
          setUser(response.user);
          setSessionId(response.sessionId || null);
          
          // Don't store credentials on registration since email confirmation is required
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
    clearError,
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