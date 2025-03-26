import { ServerResponse, CleanResponse, apiRequest } from "./api";
import { getSessionToken } from "./secureStorage";
import { Area } from "@/models/area";

export interface AreasResponse extends ServerResponse {
  data?: Area[];
}

export interface AreasCleanResponse extends CleanResponse {
  areas: Area[];
}

/**
 * Fetches all available areas
 * @returns A clean response with all areas
 */
export async function getAreas() : Promise<AreasCleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();

    // Build request data
    const data: Record<string, any> = {};

    // Add session ID if available
    if (sessionId) {
      data.PHPSESSID = sessionId;
    }

    // Make API request - this is a POST request according to the Postman collection
    const response = await apiRequest<
      AreasResponse,
      AreasCleanResponse
    >("/area/index", "POST", data, (serverResponse) => {
      return {
        areas: serverResponse.data || [],
      };
    });

    return response;
  } catch (error) {
    console.error("Error fetching areas:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to fetch areas",
      areas: [],
    };
  }
}