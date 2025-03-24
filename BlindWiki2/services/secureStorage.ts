import * as SecureStore from 'expo-secure-store';

// Keys for secure storage
const SESSION_TOKEN_KEY = 'sessionToken';
const USERNAME_KEY = 'username';
const PASSWORD_KEY = 'password';

// Session token functions
export async function saveSessionToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving session token:', error);
    throw error;
  }
}

export async function getSessionToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
}

export async function removeSessionToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing session token:', error);
  }
}

// Credentials management functions
export async function saveCredentials(username: string, password: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(USERNAME_KEY, username);
    await SecureStore.setItemAsync(PASSWORD_KEY, password);
  } catch (error) {
    console.error('Error saving credentials:', error);
    throw error;
  }
}

export async function getCredentials(): Promise<{ username: string; password: string } | null> {
  try {
    const username = await SecureStore.getItemAsync(USERNAME_KEY);
    const password = await SecureStore.getItemAsync(PASSWORD_KEY);
    if (username && password) {
      return { username, password };
    }
    return null;
  } catch (error) {
    console.error('Error getting credentials:', error);
    return null;
  }
}

export async function removeCredentials(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(USERNAME_KEY);
    await SecureStore.deleteItemAsync(PASSWORD_KEY);
  } catch (error) {
    console.error('Error removing credentials:', error);
  }
}