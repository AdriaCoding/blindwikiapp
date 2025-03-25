import { ServerResponse, CleanResponse, apiRequest } from "./api";
import { getSessionToken } from "./secureStorage";
import { Message, Attachment, Comment } from "@/models/message";
import * as FileSystem from 'expo-file-system';

// Server response interfaces
export interface MessagesResponse extends ServerResponse {
  data?: Message[];
}

export interface MessageResponse extends ServerResponse {
  data?: Message;
}

export interface CommentResponse extends ServerResponse {
  data?: Comment[];
}

// Clean response interfaces
export interface GetPostsCleanResponse extends CleanResponse {
  messages: Message[];
}

export interface GetMessageCleanResponse extends CleanResponse {
  message?: Message;
}

export interface CommentCleanResponse extends CleanResponse {
  comments?: Comment[];
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
 * Fetches messages created by the currently logged in user
 * @returns A clean response with the user's messages
 */
export async function getMyMessages(): Promise<GetPostsCleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();
    
    if (!sessionId) {
      return {
        success: false,
        errorMessage: "Authentication required to fetch your messages",
        messages: [],
      };
    }
    
    // Build request parameters
    const params: Record<string, any> = {
      author_id: "current", // The API interprets this as the current user
      PHPSESSID: sessionId,
    };

    // Make API request
    const response = await apiRequest<
      MessagesResponse,
      GetPostsCleanResponse
    >("/message/index", "GET", params, (serverResponse) => {
      return {
        messages: serverResponse.data || [],
      };
    });

    return response;
  } catch (error) {
    console.error("Error fetching user's messages:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to fetch your messages",
      messages: [],
    };
  }
}

/**
 * Fetches posts with specific tags near a location
 * @param lat Latitude of the location
 * @param long Longitude of the location
 * @param tags Comma-separated list of tag IDs
 * @returns A clean response with matching messages
 */
export async function getPostsByTags(
  lat: string,
  long: string,
  tags: string
): Promise<GetPostsCleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();
    
    // Build request parameters
    const params: Record<string, any> = {
      lat,
      long,
      tags,
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
      return {
        messages: serverResponse.data || [],
      };
    });

    return response;
  } catch (error) {
    console.error("Error fetching posts by tags:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to fetch posts by tags",
      messages: [],
    };
  }
}

/**
 * Fetches posts with specific tags in a particular area
 * @param area Area identifier
 * @param tags Comma-separated list of tag IDs
 * @returns A clean response with matching messages
 */
export async function getPostsByTagsInArea(
  area: string,
  tags: string
): Promise<GetPostsCleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();
    
    // Build request parameters
    const params: Record<string, any> = {
      in: area,
      tags,
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
      return {
        messages: serverResponse.data || [],
      };
    });

    return response;
  } catch (error) {
    console.error("Error fetching posts by tags in area:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to fetch posts by tags in area",
      messages: [],
    };
  }
}

/**
 * Fetches posts with specific tags near a location and sorts them
 * @param lat Latitude of the location
 * @param long Longitude of the location
 * @param tags Comma-separated list of tag IDs
 * @param sort Sort order (0 for default)
 * @returns A clean response with matching messages
 */
export async function getPostsByTagSearch(
  lat: string,
  long: string,
  tags: string,
  sort: string = "0"
): Promise<GetPostsCleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();
    
    // Build request parameters
    const params: Record<string, any> = {
      lat,
      long,
      tags,
      sort,
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
      return {
        messages: serverResponse.data || [],
      };
    });

    return response;
  } catch (error) {
    console.error("Error fetching posts by tag search:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to fetch posts by tag search",
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

/**
 * Updates a message's tags
 * @param messageId ID of the message to update
 * @param tags New tags to assign to the message
 * @returns A clean response indicating success or failure
 */
export async function updateMessage(
  messageId: string,
  tags: string
): Promise<CleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();

    if (!sessionId) {
      return {
        success: false,
        errorMessage: "Authentication required to update messages",
      };
    }

    // Build request data
    const data: Record<string, any> = {
      "Message[tags]": tags,
      PHPSESSID: sessionId,
    };

    // Make API request
    const response = await apiRequest<ServerResponse, CleanResponse>(
      `/message/update/${messageId}`,
      "POST",
      data
    );

    return response;
  } catch (error) {
    console.error("Error updating message:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to update message",
    };
  }
}

/**
 * Publishes a new message with an audio attachment
 * @param audioFilePath Path to the audio file to upload
 * @param latitude Latitude where the message was recorded
 * @param longitude Longitude where the message was recorded
 * @param address Physical address of the location (optional)
 * @param tags Tags to associate with the message
 * @param deviceInfo Information about the device used to record
 * @returns A clean response with the created message
 */
export async function publishMessage(
  audioFilePath: string,
  latitude: string,
  longitude: string,
  address: string = "",
  tags: string = "",
  deviceInfo: string = ""
): Promise<GetMessageCleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();

    if (!sessionId) {
      return {
        success: false,
        errorMessage: "Authentication required to publish messages",
      };
    }

    // For this function, we'll need to handle FormData differently 
    // This would typically require a different approach than our standard apiRequest
    // In a production app, you would use something like FormData with React Native's fetch
    
    const formData = new FormData();
    
    // Add the audio file
    // Note: This is a simplified example - in a real app, you would need to get the file's mime type and proper name
    formData.append("PublishForm[files][0]", {
      uri: audioFilePath,
      name: "audio.mp3",
      type: "audio/mpeg",
    } as any);
    
    formData.append("PublishForm[longitude]", longitude);
    formData.append("PublishForm[latitude]", latitude);
    formData.append("PublishForm[address]", address);
    formData.append("PublishForm[text]", "");
    formData.append("PublishForm[newtags]", tags);
    formData.append("PublishForm[device]", deviceInfo);
    formData.append("PHPSESSID", sessionId);
    
    // Since this is a special case with FormData, we need to use fetch directly
    // In a real implementation, you might want to refactor apiRequest to handle FormData
    const response = await fetch("https://api.blind.wiki/message/publish", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });
    
    const serverResponse = await response.json() as MessageResponse;
    
    if (serverResponse.status === "ok") {
      return {
        success: true,
        message: serverResponse.data,
      };
    } else {
      return {
        success: false,
        errorMessage: serverResponse.error?.message || "Failed to publish message",
      };
    }
    
  } catch (error) {
    console.error("Error publishing message:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to publish message",
    };
  }
}

/**
 * Posts a comment on a message
 * @param messageId ID of the message to comment on
 * @param text Text content of the comment
 * @returns A clean response with the posted comment
 */
export async function postComment(
  messageId: string,
  text: string
): Promise<CommentCleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();

    if (!sessionId) {
      return {
        success: false,
        errorMessage: "Authentication required to post comments",
      };
    }

    // Similar to publishMessage, this requires FormData
    const formData = new FormData();
    
    // The API expects a dummy file
    // In a real app, you'd create a small temporary file
    const dummyFilePath = await createDummyFile();
    
    formData.append("Comment[files][0]", {
      uri: dummyFilePath,
      name: "dummy.txt",
      type: "text/plain",
    } as any);
    
    formData.append("Comment[message_id]", messageId);
    formData.append("Comment[text]", text);
    formData.append("PHPSESSID", sessionId);
    
    // Use fetch directly for FormData
    const response = await fetch("https://api.blind.wiki/message/postComment", {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });
    
    const serverResponse = await response.json() as CommentResponse;
    
    if (serverResponse.status === "ok") {
      return {
        success: true,
        comments: serverResponse.data,
      };
    } else {
      return {
        success: false,
        errorMessage: serverResponse.error?.message || "Failed to post comment",
      };
    }
    
  } catch (error) {
    console.error("Error posting comment:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to post comment",
    };
  }
}

/**
 * Creates a temporary dummy file for comment uploads
 */
async function createDummyFile(): Promise<string> {
  const fileUri = `${FileSystem.cacheDirectory}dummy.txt`;
  await FileSystem.writeAsStringAsync(fileUri, "dummy file for comment");
  return fileUri;
}

/**
 * Records that an audio attachment was played
 * @param attachmentId ID of the attachment that was played
 * @returns A clean response indicating success or failure
 */
export async function audioPlayed(attachmentId: string): Promise<CleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();

    // Build request parameters
    const params: Record<string, any> = {};

    // Add session ID if available
    if (sessionId) {
      params.PHPSESSID = sessionId;
    }

    // Make API request
    const response = await apiRequest<ServerResponse, CleanResponse>(
      `/attachment/play/${attachmentId}`,
      "GET",
      params
    );

    return response;
  } catch (error) {
    console.error("Error recording audio play:", error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to record audio play",
    };
  }
}
