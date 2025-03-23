const API_BASE_URL = 'https://api.blind.wiki';

// Default options for fetch calls
const defaultOptions = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  timeout: 5000,
};

// Helper to transform objects into form data format
const transformToFormData = (data: Record<string, any>): string => {
  const formData = new URLSearchParams();
  
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  
  return formData.toString();
};

// All responses form BlindWiki API server have this structure
export interface ServerResponse {
  status: 'ok' | 'error';
  PHPSESSID: string;
  currentLanguage: {
    code: string;
    extended_code: string;
    id: string;
    name: string;
    visible: string;
  };
  languages: Array<{
    code: string;
    extended_code: string;
    id: string;
    name: string;
    visible: string;
  }>;
  labels: Array<{
    code: string;
    text: string;
  }>;
  error?: {
    message: string;
  };
  registerInfo?: {
    nonce: string;
  };
}

// Interface without ServerResponse junk
export interface CleanResponse {
  success: boolean;
  errorMessage?: string;
}
// Helper function to transform server response into client response
export function cleanResponse<T extends CleanResponse>(
  serverResponse: ServerResponse,
  additionalData: Partial<T> = {}
): T {
  const baseResponse: CleanResponse = {
    success: serverResponse.status === 'ok',
    errorMessage: serverResponse.error?.message,
  };

  return {
    ...baseResponse,
    ...additionalData,
  } as T;
}

// Main API request function delivering clean responses
export async function apiRequest<T extends ServerResponse, C extends CleanResponse>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  data?: Record<string, any>,
  cleanMapper?: (response: T) => Partial<Omit<C, keyof CleanResponse>>,
  customOptions?: RequestInit
): Promise<C> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const options: RequestInit = {
      ...defaultOptions,
      ...customOptions,
      method,
    };

    // Handle data based on request method
    if (method === 'GET' && data) {
      // For GET, append data as query params
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      const queryString = params.toString();
      const urlWithParams = `${url}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(urlWithParams, options);
      const responseData = await response.json();

      if (response.ok && responseData.status === 'ok') {
        const additionalData = cleanMapper ? cleanMapper(responseData as T) : {};
        return cleanResponse<C>(responseData, additionalData);
      }

      throw new Error(responseData.error?.message || 'API Error');
    } else if (data) {
      // For POST, transform data to form format
      options.body = transformToFormData(data);
    }

    const response = await fetch(url, options);
    const responseData = await response.json();
    console.log('API response:', responseData);
    if (response.ok && responseData.status === 'ok') {
      const additionalData = cleanMapper ? cleanMapper(responseData as T) : {};
      return cleanResponse<C>(responseData, additionalData);
    }

    throw new Error(responseData.error?.message || 'API Error');
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}