import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = 'blindwiki_session_token';

/**
 * Retrieves the session token from secure storage
 * @returns The session token or null if not found
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving session token:', error);
    return null;
  }
}

/**
 * Saves the session token to secure storage
 * @param token The session token to save
 */
export async function saveSessionToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving session token:', error);
  }
}

/**
 * Removes the session token from secure storage (for logout)
 */
export async function removeSessionToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing session token:', error);
  }
}

// Add helper to check if user is logged in
export async function isLoggedIn(): Promise<boolean> {
  const token = await getSessionToken();
  return token !== null;
}

// Rest of your existing code...