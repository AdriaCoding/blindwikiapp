import { ServerResponse, CleanResponse, apiRequest } from "./api";
import { getSessionToken } from "./secureStorage";
import { Message, Attachment } from "@/models/message";

// Server response interface
export interface MessagesResponse extends ServerResponse {
  data?: Message[];
}

// Clean response interface
export interface GetPostsCleanResponse extends CleanResponse {
  messages: Message[];
}

/**
 * Fetches posts near a specific location
 * @param lat Latitude of the location
 * @param long Longitude of the location
 * @param dist Distance in meters (default: 2000)
 * @returns A clean response with messages
 */
export async function getPosts(
  lat: string,
  long: string,
  dist: string = "2000"
): Promise<GetPostsCleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();
    // Build request parameters
    const params: Record<string, any> = {
      lat,
      long,
      dist,
    };

    // Add session ID if available
    if (sessionId) {
      params.PHPSESSID = sessionId;
    }

    // Make API request
    const response = await apiRequest<
      MessagesResponse,
      GetPostsCleanResponse
    >("/message/index", "GET", params, (serverResponse) => {
      // Transform server response to client format
      return {
        messages: serverResponse.data || [],
      };
    });

    return response;
  } catch (error) {
    console.error("Error fetching posts:", error);

    // Return a failed response
    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to fetch posts",
      messages: [],
    };
  }
}

/**
 * Searches for posts matching a search term
 * @param lat Latitude of the location
 * @param long Longitude of the location
 * @param searchTerm Text to search for
 * @returns A clean response with matching messages
 */
export async function searchPosts(
  lat: string,
  long: string,
  searchTerm: string
): Promise<GetPostsCleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();

    // Build request data
    const data: Record<string, any> = {
      "MessageSearchForm[latitude]": lat,
      "MessageSearchForm[longitude]": long,
      "MessageSearchForm[q]": searchTerm,
    };

    // Add session ID if available
    if (sessionId) {
      data.PHPSESSID = sessionId;
    }

    // Make API request - this is a POST request according to the Postman collection
    const response = await apiRequest<
      MessagesResponse,
      GetPostsCleanResponse
    >("/message/search", "POST", data, (serverResponse) => {
      return {
        messages: serverResponse.data || [],
      };
    });

    return response;
  } catch (error) {
    console.error("Error searching posts:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to search posts",
      messages: [],
    };
  }
}

/**
 * Deletes/hides a message
 * @param messageId ID of the message to hide
 * @returns A clean response indicating success or failure
 */
export async function deleteMessage(messageId: string): Promise<CleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();

    if (!sessionId) {
      return {
        success: false,
        errorMessage: "Authentication required to delete messages",
      };
    }

    // Make API request - this is a POST request according to the Postman collection
    const response = await apiRequest<ServerResponse, CleanResponse>(
      `/message/hide/${messageId}`,
      "POST",
      { PHPSESSID: sessionId }
    );

    return response;
  } catch (error) {
    console.error("Error deleting message:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to delete message",
    };
  }
}
