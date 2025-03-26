import { ServerResponse, CleanResponse, apiRequest } from "./api";
import { getSessionToken } from "./secureStorage";
import { Tag } from "@/models/tag";
import { Area } from "@/models/area";

// Server response interfaces
export interface TagsResponse extends ServerResponse {
  data?: Tag[];
}

// Clean response interfaces
export interface GetTagsCleanResponse extends CleanResponse {
  tags: Tag[];
}

export interface AreasResponse extends ServerResponse {
  data?: Area[];
}

export interface AreasCleanResponse extends CleanResponse {
  areas: Area[];
}

/**
 * Fetches tags recomendation for new message posts
 * @returns A clean response with all tags
 */
export async function getProposedTags(): Promise<GetTagsCleanResponse> {
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
      TagsResponse,
      GetTagsCleanResponse
    >("/tag/proposed", "POST", data, (serverResponse) => {
      return {
        tags: serverResponse.data || [],
      };
    });

    return response;
  } catch (error) {
    console.error("Error fetching tags:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to fetch tags",
      tags: [],
    };
  }
}

/**
 * Fetches tags given various filtering criteria (see options)
 * @param options - Optional parameters for the request
 * @returns A clean response with nearby tags
 */
export async function getTags(options: {
  lat?: string;                 // Latitude coordinate
  long?: string;                // Longitude coordinate
  area_id?: string;             // Area identifier (mapped to 'in' parameter)
  sort?: string;                // Sort order (0 = popularity, 1 = alphabetical)
  dist_init?: string;           // Initial search radius in meters
  dist_max?: string;            // Maximum search radius in meters
  min_results?: string;         // Minimum number of results desired
  customParams?: Record<string, any>; // Any additional parameters
} = {}): Promise<GetTagsCleanResponse> {
  try {
    if ((!options.lat || !options.long) && !options.area_id) {
      console.error("You must provide either 'lat' and 'long' or 'area' parameters.");
      return {
        success: false,
        errorMessage: "Missing required coordinates",
        tags: [],
      };
    }

    // Build request parameters based on provided options
    const params: Record<string, any> = {
      ...options.customParams
    };
    if (options.lat) params.lat = options.lat;
    if (options.long) params.long = options.long;
    if (options.area_id) params.in = options.area_id;  // Map 'area' to 'in' as expected by backend
    if (options.sort) params.sort = options.sort;
    if (options.dist_init) params.dist_init = options.dist_init;
    if (options.dist_max) params.dist_max = options.dist_max;
    if (options.min_results) params.min_results = options.min_results;
    
    // Get session token from secure storage
    const sessionId = await getSessionToken();
    if (sessionId) {
      params.PHPSESSID = sessionId;
    }

    // Make API request
    const response = await apiRequest<
      TagsResponse,
      GetTagsCleanResponse
    >("/tag/index", "GET", params, (serverResponse) => {
      return {
        tags: serverResponse.data || [],
      };
    });

    return response;
  } catch (error) {
    console.error("Error fetching tags:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to fetch tags",
      tags: [],
    };
  }
}

/**
 * Helper function to get tags near a specific location
 * @param lat Latitude coordinate
 * @param long Longitude coordinate
 * @param options Additional options for the request
 * @returns A clean response with nearby tags
 */

export async function getNearbyTags(
  lat: string,
  long: string,
  options: {
    sort?: string;
    dist_init?: string;
    dist_max?: string;
    min_results?: string;
  } = {}
): Promise<GetTagsCleanResponse> {
  return getTags({
    lat,
    long,
    ...options
  });
}

/**
 * Helper function to get tags in a specific area
 * @param area_id Area identifier
 * @param options Additional options for the request
 * @returns A clean response with tags in the area
 */
export async function getTagsByArea(
  area_id: string,
  options: {
    sort?: string;
  } = {}
): Promise<GetTagsCleanResponse> {
  return getTags({
    area_id: area_id,
    ...options
  });
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