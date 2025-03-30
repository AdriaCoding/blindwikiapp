import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Keys for secure storage
const SESSION_TOKEN_KEY = 'sessionToken';
const USERNAME_KEY = 'username';
const PASSWORD_KEY = 'password';

// Función para verificar si estamos en web
const isWeb = Platform.OS === 'web';

// Implementación web usando localStorage
const webStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  deleteItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }
};

// Session token functions
export async function saveSessionToken(token: string): Promise<void> {
  try {
    if (isWeb) {
      webStorage.setItem(SESSION_TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error('Error saving session token:', error);
    throw error;
  }
}

export async function getSessionToken(): Promise<string | null> {
  try {
    if (isWeb) {
      return webStorage.getItem(SESSION_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
}

export async function removeSessionToken(): Promise<void> {
  try {
    if (isWeb) {
      webStorage.deleteItem(SESSION_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error removing session token:', error);
  }
}

// Credentials management functions
export async function saveCredentials(username: string, password: string): Promise<void> {
  try {
    if (isWeb) {
      webStorage.setItem(USERNAME_KEY, username);
      webStorage.setItem(PASSWORD_KEY, password);
    } else {
      await SecureStore.setItemAsync(USERNAME_KEY, username);
      await SecureStore.setItemAsync(PASSWORD_KEY, password);
    }
  } catch (error) {
    console.error('Error saving credentials:', error);
    throw error;
  }
}

export async function getCredentials(): Promise<{ username: string; password: string } | null> {
  try {
    let username: string | null;
    let password: string | null;

    if (isWeb) {
      username = webStorage.getItem(USERNAME_KEY);
      password = webStorage.getItem(PASSWORD_KEY);
    } else {
      username = await SecureStore.getItemAsync(USERNAME_KEY);
      password = await SecureStore.getItemAsync(PASSWORD_KEY);
    }

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
    if (isWeb) {
      webStorage.deleteItem(USERNAME_KEY);
      webStorage.deleteItem(PASSWORD_KEY);
    } else {
      await SecureStore.deleteItemAsync(USERNAME_KEY);
      await SecureStore.deleteItemAsync(PASSWORD_KEY);
    }
  } catch (error) {
    console.error('Error removing credentials:', error);
  }
}