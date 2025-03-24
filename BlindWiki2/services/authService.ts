import User from '@/models/user';
import { apiRequest, ServerResponse, CleanResponse } from './api';
import { getSessionToken, saveSessionToken, removeSessionToken } from '@/services/secureStorage';


// Add new interfaces for profile fetching
export interface ProfileRequest {
  'PHPSESSID': string;
}

export interface ProfileServerResponse extends ServerResponse {
  data: Array<User>;
}

export interface ProfileCleanResponse extends CleanResponse {
  user?: User;
}

/**
 * Fetches the current user profile using the session token
 * @returns A clean response with the user profile if successful
 */
export async function fetchUserProfile(): Promise<ProfileCleanResponse> {
  const sessionId = await getSessionToken();
  
  if (!sessionId) {
    return {
      success: false,
      errorMessage: 'No active session found'
    };
  }

  const data: ProfileRequest = {
    'PHPSESSID': sessionId
  };

  try {
    // Use the user profile endpoint - adjust path as needed for your API
    const response = await apiRequest<ProfileServerResponse, ProfileCleanResponse>(
      '/site/profile',  // Update this to match your actual endpoint
      'POST',
      data,
      (serverResponse) => {
        if (!serverResponse.data || serverResponse.data.length === 0) {
          return {}; // No user data
        }
        return {
          user: serverResponse.data[0]
        };
      }
    );
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        errorMessage: error.message
      };
    }
    return {
      success: false,
      errorMessage: 'Failed to fetch user profile'
    };
  }
}

// Request type
export interface LoginRequest {
  'LoginForm[username]': string;
  'LoginForm[password]': string;
  'LoginForm[latitude]': string;
  'LoginForm[longitude]': string;
  'PHPSESSID'?: string;
}

// Server response extension
export interface LoginServerResponse extends ServerResponse {
  data: Array<User>;
}

// Clean response type
export interface LoginCleanResponse extends CleanResponse {
  user?: User;
  sessionId?: string;
}



// Login function
export async function login(
  username: string,
  password: string,
  lat: string,
  long: string
): Promise<LoginCleanResponse> {
  const data: LoginRequest = {
    'LoginForm[username]': username,
    'LoginForm[password]': password,
    'LoginForm[latitude]': lat,
    'LoginForm[longitude]': long,
  };

  const sessionId = await getSessionToken();
  if (sessionId) {
    data['PHPSESSID'] = sessionId;
  }

  try {
    // Use the mapper function to extract the data we want
    const response = await apiRequest<LoginServerResponse, LoginCleanResponse>(
      '/site/login',
      'POST',
      data,
      (serverResponse) => {
        // Only include user data if we have it
        if (!serverResponse.data || serverResponse.data.length === 0) {
          return {
            sessionId: serverResponse.PHPSESSID
          };
        }
        return {
          user: serverResponse.data[0],
          sessionId: serverResponse.PHPSESSID
        };
      }
    );
    console.log('Cleaned response:', response);
    // Save session token if available
    if (response.sessionId) {
      await saveSessionToken(response.sessionId);
    }
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        errorMessage: error.message
      };
    }
    return {
      success: false,
      errorMessage: 'Unknown error occurred'
    };
  }
}

export interface LogoutRequest {
  'PHPSESSID': string;
}

export interface LogoutServerResponse extends ServerResponse {
  // The logout endpoint doesn't return any specific data
}

// Clean response type
export interface LogoutCleanResponse extends CleanResponse {
  // We don't need additional fields for logout response
}
/**
 * Logs out the current user and removes their session
 * @returns A clean response indicating success or failure
 */
export async function logout(): Promise<LogoutCleanResponse> {
  const sessionId = await getSessionToken();
  
  if (!sessionId) {
    return {
      success: false,
      errorMessage: 'No active session found'
    };
  }

  const data: LogoutRequest = {
    'PHPSESSID': sessionId
  };

  try {
    // Call the logout endpoint
    const response = await apiRequest<LogoutServerResponse, LogoutCleanResponse>(
      '/site/logout',
      'POST',
      data
    );

    // Always remove the session token on logout attempt, 
    // even if server returns an error
    await removeSessionToken();
    
    return response;
  } catch (error) {
    // Still remove the session token if there's an error
    await removeSessionToken();
    
    if (error instanceof Error) {
      return {
        success: false,
        errorMessage: error.message
      };
    }
    return {
      success: false,
      errorMessage: 'Logout failed'
    };
  }
}