import User from "@/models/user";
import { apiRequest, ServerResponse, CleanResponse } from "./api";
import {
  getSessionToken,
  saveSessionToken,
  removeSessionToken,
} from "@/services/secureStorage";
import { MD5 } from "crypto-js";


// LOGIN endpoint
export interface LoginRequest {
  "LoginForm[username]": string;
  "LoginForm[password]": string;
  "LoginForm[latitude]": string;
  "LoginForm[longitude]": string;
  PHPSESSID?: string;
}
export interface LoginServerResponse extends ServerResponse {
  data: Array<User>;
}
export interface LoginCleanResponse extends CleanResponse {
  user?: User;
  sessionId?: string;
}

// LOGOUT endpoint




// REGISTER endpoint
export interface RegisterRequest {
  "User[username]": string;
  "User[password]": string;
  "User[password_repeat]": string;
  "User[email]": string;
  "User[latitude]": string;
  "User[longitude]": string;
  "User[registerHash]"?: string;
  PHPSESSID?: string;
}
export interface RegisterServerResponse extends ServerResponse {
  data?: Array<User>;
  userRegisterInfo: {
    nonce: string;
  };
}
export interface RegisterCleanResponse extends CleanResponse {
  user?: User;
  sessionId?: string;
  activationNeeded?: boolean;
  email?: string;
}

// Login function
export async function login(
  username: string,
  password: string,
  lat: string,
  long: string
): Promise<LoginCleanResponse> {
  const data: LoginRequest = {
    "LoginForm[username]": username,
    "LoginForm[password]": password,
    "LoginForm[latitude]": lat,
    "LoginForm[longitude]": long,
  };

  const sessionId = await getSessionToken();
  if (sessionId) {
    data["PHPSESSID"] = sessionId;
  }

  try {
    // Use the mapper function to extract the data we want
    const response = await apiRequest<LoginServerResponse, LoginCleanResponse>(
      "/site/login",
      "POST",
      data,
      (serverResponse) => {
        // Only include user data if we have it
        if (!serverResponse.data || serverResponse.data.length === 0) {
          return {
            sessionId: serverResponse.PHPSESSID,
          };
        }
        return {
          user: serverResponse.data[0],
          sessionId: serverResponse.PHPSESSID,
        };
      }
    );
    // Save session token if available
    if (response.sessionId) {
      await saveSessionToken(response.sessionId);
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }
    return {
      success: false,
      errorMessage: "Unknown error occurred",
    };
  }
}

/**
 * Logs out the current user and removes their session
 * @returns A clean response indicating success or failure
 */

export async function logout(): Promise<CleanResponse> {
  const sessionId = await getSessionToken();

  if (!sessionId) {
    return {
      success: false,
      errorMessage: "No active session found",
    };
  }

  const data ={
    PHPSESSID: sessionId,
  };

  try {
    // Call the logout endpoint
    const response = await apiRequest<
      ServerResponse,
      CleanResponse
    >("/site/logout", "POST", data);

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
        errorMessage: error.message,
      };
    }
    return {
      success: false,
      errorMessage: "Logout failed",
    };
  }
}


/**
 * Fetches the registration nonce from the server
 * @returns A nonce to use for registration
*/
export async function fetchRegistrationNonce(): Promise<string | null> {
  try {
    const sessionId = await getSessionToken();
    const data = sessionId? { PHPSESSID: sessionId } : {};
  
    const response = await apiRequest<
    ServerResponse & { userRegisterInfo: { nonce: string } },
    CleanResponse & { userRegisterInfo: { nonce: string } }
    >("/user/register", "GET", data,
      (serverResponse) => ({
        userRegisterInfo: serverResponse.userRegisterInfo
      })
    );
    if (response.success && response.userRegisterInfo?.nonce) {
      return response.userRegisterInfo.nonce;
    }
    return null;
  } catch (error) {
    console.error("Error fetching registration nonce:", error);
    return null;
  }
}

/**
 * Computes the register hash using the nonce from registerInfo
 * @param nonce The nonce string from the API
 * @returns Register hash for validation
 */
export async function computeRegisterHash(nonce: string): Promise<string> {
  // The server uses md5(nonce + secret) where secret is "8976" as seen in WebApi.php
  const secret = "8976";
  return MD5(nonce + secret).toString();
}

/**
 * Registers a new user with the provided information
 * @param username Username for the new account
 * @param password Password for the new account
 * @param email Email address for the new account
 * @param lat Latitude for the user's location
 * @param long Longitude for the user's location
 * @returns A clean response with the user data if successful
 */
export async function register(
  username: string,
  password: string,
  email: string,
  lat: string,
  long: string
): Promise<RegisterCleanResponse> {
  try {
    // First, we need to get the nonce from registerInfo
    const nonce = await fetchRegistrationNonce();

    if (!nonce) {
      return {
        success: false,
        errorMessage: "Failed to get registration nonce",
      };
    }

    // Compute the hash for registration using the algorithm from WebApi.php
    const registerHash = await computeRegisterHash(nonce);
    console.log("Computed register hash:", registerHash);
    // Create the registration request
    const data: RegisterRequest = {
      "User[username]": username,
      "User[password]": password,
      "User[password_repeat]": password,
      "User[email]": email,
      "User[latitude]": lat,
      "User[longitude]": long,
      "User[registerHash]": registerHash,
    };

    // Send the registration request
    const response = await apiRequest<
      RegisterServerResponse,
      RegisterCleanResponse
    >("/user/register", "POST", data, (serverResponse) => {
      // Extract the data we want from the server response
      const result: Partial<Omit<RegisterCleanResponse, keyof CleanResponse>> =
        {
          sessionId: serverResponse.PHPSESSID,
        };

      // Check if we have user data
      if (serverResponse.data && serverResponse.data.length > 0) {
        result.user = serverResponse.data[0];
        result.activationNeeded = true; // Based on server code, users need activation
        result.email = email;
      }

      return result;
    });
    console.log("Cleaned register response:", response);
    // Save session token if available
    if (response.sessionId) {
      await saveSessionToken(response.sessionId);
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        errorMessage: error.message,
      };
    }
    return {
      success: false,
      errorMessage: "Unknown error during registration",
    };
  }
}
