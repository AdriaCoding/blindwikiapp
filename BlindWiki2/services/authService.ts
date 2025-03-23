import User from '@/models/user';
import { apiRequest, ServerResponse, CleanResponse } from './api';
import { getSessionToken, saveSessionToken } from '@/services/secureStorage';
import * as SecureStore from 'expo-secure-store';
import Language from '@/models/language';
import Area from '@/models/area';

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