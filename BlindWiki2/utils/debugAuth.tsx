import * as AuthService from '@/services/authService';

// Create a global debug object to access auth functions
declare global {
  interface Window {
    debugAuth: typeof AuthService & {
      testRegisterFlow: (username: string, email: string, password: string) => Promise<void>;
    };
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

// Export all auth functions plus the test helper
export function setupDebugAuth(): void {
  if (typeof window !== 'undefined') {
    window.debugAuth = {
      ...AuthService,
      testRegisterFlow,
    };
    
    console.log('🛠️ Auth debug utils are ready! Use window.debugAuth to access auth functions');
  }
}