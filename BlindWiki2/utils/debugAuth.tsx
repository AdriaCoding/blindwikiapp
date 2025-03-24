import * as AuthService from '@/services/authService';
import * as SecureStore from 'expo-secure-store';
import { View, StyleSheet, Text, ScrollView} from 'react-native';
import { Button, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';

// List of all known keys used in secure storage
const KNOWN_SECURE_KEYS = [
  'sessionToken',
  'username',
  'password',
  // Add any other keys your app uses
];

// Create a global debug object to access auth functions
declare global {
  interface Window {
    debugAuth: typeof AuthService & {
      testRegisterFlow: (username: string, email: string, password: string) => Promise<void>;
      getAllSecureItems: () => Promise<Record<string, string | null>>;
      clearAllSecureItems: () => Promise<void>;
    };
  }
}

// Add a function to retrieve all secure items
async function getAllSecureItems(): Promise<Record<string, string | null>> {
  console.log('🔍 Retrieving all secure items...');
  
  try {
    const result: Record<string, string | null> = {};
    
    // Fetch each known key
    for (const key of KNOWN_SECURE_KEYS) {
      try {
        const value = await SecureStore.getItemAsync(key);
        result[key] = value;
        console.log(`📦 ${key}: ${value ? value : 'null'}`);
      } catch (error) {
        console.error(`❌ Error retrieving ${key}:`, error);
        result[key] = null;
      }
    }
    
    return result;
  } catch (error) {
    console.error('💥 Error retrieving secure items:', error);
    return {};
  }
}

// Add a function to clear all secure items
async function clearAllSecureItems(): Promise<void> {
  console.log('🧹 Clearing all secure items...');
  
  try {
    for (const key of KNOWN_SECURE_KEYS) {
      try {
        await SecureStore.deleteItemAsync(key);
        console.log(`🗑️ Deleted ${key}`);
      } catch (error) {
        console.error(`❌ Error deleting ${key}:`, error);
      }
    }
    console.log('✅ All items cleared successfully');
  } catch (error) {
    console.error('💥 Error clearing secure items:', error);
  }
}

// Add a test helper function to run the full registration flow
async function testRegisterFlow(
  username: string,
  email: string, 
  password: string
): Promise<void> {
  console.log('🧪 Testing register flow...');
  
  try {
    console.log('#1 Getting registration nonce...');
    const nonce = await AuthService.fetchRegistrationNonce();
    console.log('✅ Received nonce:', nonce);
    
    if (!nonce) {
      console.error('❌ Failed to get nonce');
      return;
    }
    
    console.log('#2 Computing register hash...');
    const hash = await AuthService.computeRegisterHash(nonce);
    console.log('✅ Generated hash:', hash);
    
    console.log('#3 Registering user...');
    // Default Barcelona coordinates
    const response = await AuthService.register(
      username, 
      password, 
      email, 
      "41.38879", 
      "2.15899"
    );
    
    console.log('🔍 Registration response:', response);
    
    if (response.success) {
      console.log('✅ Registration successful!');
      console.log('👤 User:', response.user);
      console.log('🔑 Session ID:', response.sessionId);
    } else {
      console.error('❌ Registration failed:', response.errorMessage);
    }
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
}

// Export all auth functions plus the test helpers
export function setupDebugAuth(): void {
  // For React Native
  if (global) {
    // @ts-ignore - Add to global scope for console access
    global.debugAuth = {
      ...AuthService,
      testRegisterFlow,
      getAllSecureItems,
      clearAllSecureItems
    };
    
    console.log('🛠️ Auth debug utils are ready! Use global.debugAuth to access auth functions');
  }
  
  // For Web (if using Expo Web)
  if (typeof window !== 'undefined') {
    window.debugAuth = {
      ...AuthService,
      testRegisterFlow,
      getAllSecureItems,
      clearAllSecureItems
    };
    
    console.log('🛠️ Auth debug utils are ready! Use window.debugAuth to access auth functions');
  }
}
