import { ServerResponse, CleanResponse, apiRequest } from "./api";
import { getSessionToken } from "./secureStorage";
import { Message, Attachment, Comment } from "@/models/message";
import * as FileSystem from 'expo-file-system';
import { useAuth } from "@/contexts/AuthContext"; // Add this import
import axios from 'axios'; // Import axios for HTTP requests
import { Platform } from 'react-native';
import { Alert } from 'react-native';
import { APP_TO_SEAMLESS_LANG, SupportedLanguage } from '@/locales/i18n'; // Import the new map and type
import i18n from '@/locales/i18n'; // Import i18n to get current language

// Server response interfaces
export interface MessagesResponse extends ServerResponse {
  data?: Message[];
}

export interface MessageResponse extends ServerResponse {
  data?: Message[] | Message; // Can be either an array or single message
}

export interface CommentResponse extends ServerResponse {
  data?: Comment[];
}

// Clean response interfaces
export interface GetPostsCleanResponse extends CleanResponse {
  messages: Message[];
}

export type GetMessageCleanResponse = {
  success: boolean;
  message?: Message;
  errorMessage?: string;
  details?: string;  // Add details field for error information
};

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
export async function searchMessages(
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
 * Fetches messages based on various filtering creiteria (see options)
 * 
 * @param options - Optional parameters for the request
 * @returns A clean response with messages matching the criteria
 */
export async function getMessages(options: {
  lat?: string;                 // Latitude coordinate
  long?: string;                // Longitude coordinate
  dist?: string;                // Distance in meters
  authorId?: string;            // User ID to filter messages by author
  tags?: string;                // Comma-separated tag IDs
  area?: string;                // Area identifier (used with 'in' parameter)
  sort?: string;                // Sort order (0 for default)
  customParams?: Record<string, any>; // Any additional parameters
} = {}): Promise<GetPostsCleanResponse> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();
    
    // Build request parameters based on provided options
    const params: Record<string, any> = {
      ...options.customParams
    };
    
    // Add parameters if they exist
    if (options.lat) params.lat = options.lat;
    if (options.long) params.long = options.long;
    if (options.dist) params.dist = options.dist;
    if (options.authorId) params.author_id = options.authorId;
    if (options.tags) params.tags = options.tags;
    if (options.area) params.in = options.area;
    if (options.sort) params.sort = options.sort;
    
    // Add session ID if available
    if (sessionId) {
      params.PHPSESSID = sessionId;
    }

    // Determine what type of request we're making for better error handling
    let requestType = "messages";
    if (options.authorId) requestType = "user messages";
    if (options.tags && options.area) requestType = "area messages with tags";
    else if (options.tags && options.lat) requestType = "location messages with tags";
    
    // Make API request
    const response = await apiRequest<
      MessagesResponse,
      GetPostsCleanResponse
    >("/message/index", "GET", params, (serverResponse) => {
      return {
        messages: serverResponse.data || [],
      };
    });

    // Extra validation for user messages
    if (options.authorId && response.success) {
      // Check if any messages don't belong to the requested user
      if (response.messages.some(msg => 
        msg.authorUser?.id && msg.authorUser.id !== options.authorId)
      ) {
        console.warn(`Warning: returned messages do not all belong to the user with id ${options.authorId}`);
      }
      
      // Check if no messages were found
      if (response.messages.length === 0) {
        console.warn(`Warning: no messages found for user with id ${options.authorId}`);
      }
    }

    return response;
  } catch (error) {
    console.error(`Error fetching ${options.authorId ? "user" : ""} messages:`, error);

    return {
      success: false,
      errorMessage: error instanceof Error 
        ? error.message 
        : `Failed to fetch ${options.authorId ? "user" : ""} messages`,
      messages: [],
    };
  }
}

/**
 * Helper function to get Messages from user
 * @param user_id The user ID to get messages from
 * @returns A clean response with array of Messages
 */
export async function getMessagesFromUser(user_id: string): Promise<GetPostsCleanResponse> {
  return getMessages({ authorId: user_id });
}

/**
 * Hides a message (like deleting, but not really). Requires authentication.
 * If the message is already hidden, the response will still be successful
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
    console.error(`Error deleting message, probably because message ${messageId} does not exist.`, error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to delete message",
    };
  }
}

/**
 * Updates a message's tags. The new set of tags will replace the existing tags.
 * Can apply succesfully to hidden messages.
 * @param messageId ID of the message to update
 * @param tags New tags to assign to the message
 * @returns A clean response indicating success or failure
 */
export async function updateMessageTags(
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
    console.error(`Error updating message, probably because message ${messageId} does not exist:`, error);

    return {
      success: false,
      errorMessage:
        error instanceof Error ? error.message : "Failed to update message",
    };
  }
}

/**
 * Procesa un mensaje con el tagger para extraer transcripción y etiquetas del audio
 * Esta función es silenciosa y solo muestra un error si falla
 * @param messageId ID del mensaje a procesar
 */
async function processTagger(messageId: string): Promise<void> {
  try {
    // Get session token from secure storage
    const sessionId = await getSessionToken();

    if (!sessionId) {
      console.error("No session token available for tagger");
      return;
    }

    // Make API request
    const response = await apiRequest<ServerResponse, CleanResponse>(
      `/message/processTagger/${messageId}`,
      "POST",
      { PHPSESSID: sessionId }
    );

    if (!response.success) {
      // Solo mostrar alerta si hay error
      Alert.alert(
        "Error al procesar audio",
        response.errorMessage || "No se pudo procesar el audio con el tagger"
      );
    }
  } catch (error) {
    console.error("Error calling tagger:", error);
    Alert.alert(
      "Error al procesar audio",
      error instanceof Error ? error.message : "Error desconocido al procesar el audio"
    );
  }
}

/**
 * Publishes a new message with an audio attachment. Requires authentication.
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

    // Check if the audio file exists
    const fileInfo = await FileSystem.getInfoAsync(audioFilePath);
    
    if (!fileInfo.exists) {
      return {
        success: false,
        errorMessage: "Audio file not found at the specified path",
      };
    }

    // Información del dispositivo con detalles de la plataforma
    const platformInfo = deviceInfo || Platform.OS; // Simplemente "ios" o "android"

    // Extract filename and determine MIME type
    const filename = audioFilePath.split('/').pop() || `audio.${Platform.OS === 'ios' ? 'm4a' : 'mp3'}`;
    const extension = filename.split('.').pop()?.toLowerCase() || (Platform.OS === 'ios' ? 'm4a' : 'mp3');
    const mimeType = getMimeTypeForExtension(extension);
    
    // Create form data object
    const formData = new FormData();
    
    // Read the file data and create a blob
    const fileUri = audioFilePath;
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64
    });
    
    // Create a Blob from the base64 data
    const fileBlob = {
      uri: fileUri,
      name: filename,
      type: mimeType,
    };
    
    // Add the audio file to the form data
    formData.append("PublishForm[files][0]", fileBlob as any);
    
    // Add other required form data
    formData.append("PublishForm[longitude]", longitude);
    formData.append("PublishForm[latitude]", latitude);
    formData.append("PublishForm[address]", address);
    formData.append("PublishForm[text]", "");
    formData.append("PublishForm[newtags]", tags);
    formData.append("PublishForm[device]", platformInfo);
    formData.append("PHPSESSID", sessionId);
    
    // Enable the automatic tagging functionality
    formData.append("use_tagger", "true");
    
    // Using axios to upload the file
    const response = await axios({
      method: 'post',
      url: 'https://api.blind.wiki/message/publish',
      data: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      }
    });
    
    const serverResponse = response.data as MessageResponse;
    
    if (serverResponse.status === "ok") {
      // Handle both array and single message responses
      const messageData = Array.isArray(serverResponse.data) 
        ? serverResponse.data[0]  // Get first message from array
        : serverResponse.data;    // Use single message directly

      if (messageData?.id) {
        // Llamar al tagger de forma asíncrona sin esperar respuesta
        processTagger(messageData.id).catch(error => {
          console.error("[publishMessage] Background tagger processing failed:", error);
        });

        return {
          success: true,
          message: messageData,
        };
      }
    }

    // Handle error case
    console.error('[publishMessage] Server returned error:', serverResponse.error);
    return {
      success: false,
      errorMessage: serverResponse.error?.message || "Failed to publish message",
      details: serverResponse.error?.message
    };
    
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
 * @param audioFilePath Optional path to an audio file for the comment
 * @returns A clean response with the posted comment
 */
export async function postComment(
  messageId: string,
  text: string,
  audioFilePath?: string
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
    
    // Add required comment data
    formData.append("Comment[message_id]", messageId);
    formData.append("Comment[text]", text);
    formData.append("PHPSESSID", sessionId);
    
    // Handle file attachment based on what's provided
    if (audioFilePath) {
      // If an audio file is provided, use it
      try {
        const fileInfo = await FileSystem.getInfoAsync(audioFilePath);
        if (fileInfo.exists) {
          // Determine file extension and mime type from the path
          const extension = audioFilePath.split('.').pop()?.toLowerCase() || 'wav';
          const mimeType = getMimeTypeForExtension(extension);
          
          formData.append("Comment[files][0]", {
            uri: audioFilePath,
            name: `comment_audio.${extension}`,
            type: mimeType,
          } as any);
          
          console.log(`Attaching audio file: ${audioFilePath}`);
        } else {
          console.warn(`Audio file not found at path: ${audioFilePath}`);
        }
      } catch (error) {
        console.error("Error accessing audio file:", error);
      }
    }
    
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
 * Helper function to get the MIME type for a file extension
 */
function getMimeTypeForExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    'mp3': 'audio/mpeg',
    'mp4': 'audio/mp4',
    'm4a': 'audio/mp4',
    'aac': 'audio/aac',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'webm': 'audio/webm',
    '3gp': 'audio/3gpp',
  };
  
  return mimeTypes[extension] || 'audio/aac';
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

/**
 * Sends audio to a local seamless server and expects the same audio back.
 * @param audioFilePath Path to the audio file to process
 * @returns A clean response indicating success or failure, and potentially the echoed audio data/path
 */
export async function processAudioWithSeamlessServer(
  audioFilePath: string
): Promise<{ success: boolean; audioBlob?: Blob; errorMessage?: string; details?: string; }> {
  const SEAMLESS_SERVER_URL = 'http://100.112.0.35:8080/';

  try {
    const fileInfo = await FileSystem.getInfoAsync(audioFilePath);
    if (!fileInfo.exists) {
      return {
        success: false,
        errorMessage: "Audio file not found at the specified path",
      };
    }

    const filename = audioFilePath.split('/').pop() || `audio.${Platform.OS === 'ios' ? 'm4a' : 'mp3'}`;
    const extension = filename.split('.').pop()?.toLowerCase() || (Platform.OS === 'ios' ? 'm4a' : 'mp3');
    const mimeType = getMimeTypeForExtension(extension);

    const formData = new FormData();
    const fileBlob = {
      uri: audioFilePath,
      name: filename,
      type: mimeType,
    };

    formData.append("audio_file", fileBlob as any);

    // Get the current app language and map it to seamless language code
    const currentAppLang = i18n.language as SupportedLanguage;
    const tgtLang = APP_TO_SEAMLESS_LANG[currentAppLang] || 'eng'; // Default to 'eng' if not found
    formData.append("tgt_lang", tgtLang);

    console.log(`Sending audio to seamless server: ${filename}, type: ${mimeType}, target_lang: ${tgtLang}`);

    const response = await axios({
      method: 'post',
      url: SEAMLESS_SERVER_URL,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });

    if (response.status === 200 && response.data) {
      console.log('Received audio back from seamless server:', response.headers['content-type'], response.data.size + ' bytes');
      return {
        success: true,
        audioBlob: response.data as Blob,
      };
    } else {
      return {
        success: false,
        errorMessage: `Server returned status ${response.status}`,
      };
    }
  } catch (error) {
    console.error("Error processing audio with seamless server:", error);
    const errorMessage =
      axios.isAxiosError(error) && error.response
        ? `Server error: ${error.response.status} - ${error.response.data}`
        : error instanceof Error
        ? error.message
        : "Failed to process audio with seamless server";
    return {
      success: false,
      errorMessage: errorMessage,
    };
  }
}
