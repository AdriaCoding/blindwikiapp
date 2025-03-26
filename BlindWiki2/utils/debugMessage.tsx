import * as MessageService from "@/services/messageService";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { Button, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { Message } from "@/models/message";

// Create a global debug object to access message functions
declare global {
  interface Window {
    debugMessage: typeof MessageService & {
      // POST endpoint to search for messages
      testSearchPosts: (
        lat?: string,
        long?: string,
        searchTerm?: string
      ) => Promise<void>;
      testDeleteMessage: (messageId?: string) => Promise<void>;
      // GET endpoint for filtering messages & filters
      testGetMessages: (options?: {
        lat?: string;
        long?: string;
        dist?: string;
        authorId?: string;
        tags?: string;
        area?: string;
        sort?: string;
        description?: string;
      }) => Promise<void>;
      testGetMessagesByLocation: () => Promise<void>; //filter
      testGetMessagesByAuthor: () => Promise<void>; //filter
      testGetMessagesByTags: () => Promise<void>; //filter
      testGetMessagesByArea: () => Promise<void>; //filter
      testGetMessagesByAreaAndTags: () => Promise<void>; //filter

      testUpdateMessage: (
        messageId?: string,
        tags?: string
      ) => Promise<void>;
      testPublishMessage: (
        audioFilePath?: string,
        latitude?: string,
        longitude?: string,
        address?: string,
        tags?: string
      ) => Promise<void>;
      testPostComment: (
        messageId?: string,
        text?: string
      ) => Promise<void>;
      testAudioPlayed: (attachmentId?: string) => Promise<void>;
    };
  }
}

const DEFAULT_LAT = "41.3925366";
const DEFAULT_LONG = "2.1226543";
const DEFAULT_TAGS = "1,3,5"; // Example tags
const DEFAULT_AREA = "640"; // Barcelona area ID
const DEFAULT_MESSAGE_ID = "71709";
const DEFAULT_ATTACHMENT_ID = "88451";
const SAMPLE_AUDIO_PATH = "@/data/sample_audio.mp3";
const USER_ID = "5897"; // Blas user Id

// Test function for the getMessages endpoint with various parameter combinations
export async function testGetMessages(options: {
  lat?: string;
  long?: string;
  dist?: string;
  authorId?: string;
  tags?: string;
  area?: string;
  sort?: string;
  description?: string; // For better debug output
} = {}): Promise<void> {
  // Create a description based on the parameters
  const description = options.description || generateTestDescription(options);
  console.log(`🧪 Testing getMessages: ${description}`);

  try {
    console.log(`🔍 Fetching messages with parameters:`, options);
    const response = await MessageService.getMessages(options);

    const { messages, ...responseMetadata } = response;
    console.log("🔍 Response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Found ${messages.length} messages`);
      
      // Log the first few messages
      messages.slice(0, 3).forEach((msg, idx) => {
        console.log(
          `📝 Message ${idx + 1}: ID ${msg.id}, by ${
            msg.authorUser?.displayName || "Unknown"
          }, date: ${msg.dateTime}`
        );
      });
      
      // Check for common issues based on backend behavior
      
      // 1. Author check - if authorId is provided, all messages should be from that author
      if (options.authorId && messages.length > 0) {
        const nonAuthorMessages = messages.filter(
          msg => msg.authorUser?.id !== options.authorId
        );
        
        if (nonAuthorMessages.length > 0) {
          console.warn(
            `⚠️ Found ${nonAuthorMessages.length} messages not from user ${options.authorId}`
          );
          console.warn(
            `⚠️ This might indicate backend is ignoring the author_id parameter`
          );
        } else {
          console.log(`✅ All messages belong to author ID ${options.authorId}`);
        }
      }
      
      // 2. Tag check - simple notification
      if (options.tags && messages.length > 0) {
        console.log(`ℹ️ Requested tag filter: ${options.tags}`);
        // Can't validate tags easily as they might not be included in the response
      }
      
      // 3. Check sorting if specified
      if (options.sort && messages.length > 1) {
        // Assuming sort=0 means newest first (by date)
        const isChronological = isSortedByDate(messages, options.sort === "0");
        if (isChronological) {
          console.log(`✅ Messages are properly sorted by date`);
        } else {
          console.warn(`⚠️ Messages may not be properly sorted`);
        }
      }
      
    } else {
      console.error("❌ Failed to fetch messages:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Helper function to generate a test description
function generateTestDescription(options: any): string {
  if (options.authorId) return `User messages (author_id: ${options.authorId})`;
  if (options.tags && options.area) return `Area messages with tags (area: ${options.area}, tags: ${options.tags})`;
  if (options.tags && options.lat) return `Location messages with tags (lat: ${options.lat}, long: ${options.long}, tags: ${options.tags})`;
  if (options.lat) return `Nearby messages (lat: ${options.lat}, long: ${options.long}, dist: ${options.dist || "default"})`;
  return "All messages (default parameters)";
}

// Helper function to check if messages are sorted by date
function isSortedByDate(messages: Message[], newestFirst: boolean = true): boolean {
  if (messages.length <= 1) return true;
  
  for (let i = 0; i < messages.length - 1; i++) {
    const current = new Date(messages[i].dateTime).getTime();
    const next = new Date(messages[i + 1].dateTime).getTime();
    
    if (newestFirst) {
      if (current < next) return false;
    } else {
      if (current > next) return false;
    }
  }
  
  return true;
}


// Test function for searching posts
export async function testSearchMessages(
  lat: string = DEFAULT_LAT,
  long: string = DEFAULT_LONG,
  searchTerm: string = "parc"
): Promise<void> {
  console.log("🧪 Testing searchPosts...");

  try {
    console.log(
      `🔍 Searching for posts with term: "${searchTerm}" near lat: ${lat}, long: ${long}...`
    );
    const response = await MessageService.searchMessages(lat, long, searchTerm);

    const { messages, ...responseMetadata } = response;
    console.log("🔍 SearchPosts response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Found ${response.messages.length} matching messages`);
      response.messages.forEach((msg, idx) => {
        console.log(
          `📝 Match ${idx + 1}: ID ${msg.id}, by ${
            msg.authorUser?.displayName || "Unknown"
          }`
        );
      });
    } else {
      console.error("❌ Failed to search posts:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for deleting a message
export async function testDeleteMessage(
  messageId: string = DEFAULT_MESSAGE_ID
): Promise<void> {
  console.log("🧪 Testing deleteMessage...");

  try {
    console.log(`🗑️ Attempting to delete message with ID: ${messageId}...`);
    const response = await MessageService.deleteMessage(messageId);

    const responseWithoutMessage = { ...response };
    console.log("🔍 DeleteMessage response:", responseWithoutMessage);

    if (response.success) {
      console.log("✅ Message deleted successfully");
    } else {
      console.error("❌ Failed to delete message:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for updating a message
export async function testUpdateMessageTags(
  messageId: string = DEFAULT_MESSAGE_ID,
  tags: string = DEFAULT_TAGS
): Promise<void> {
  console.log("🧪 Testing updateMessage...");

  try {
    console.log(
      `✏️ Updating message ID: ${messageId} with tags: "${tags}"...`
    );
    const response = await MessageService.updateMessageTags(messageId, tags);

    console.log("🔍 UpdateMessage response:", response);

    if (response.success) {
      console.log("✅ Message updated successfully");
    } else {
      console.error("❌ Failed to update message:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for publishing a message
export async function testPublishMessage(
  audioFilePath: string = SAMPLE_AUDIO_PATH,
  latitude: string = DEFAULT_LAT,
  longitude: string = DEFAULT_LONG,
  address: string = "Carrer de Santa Amèlia, Barcelona",
  tags: string = "Yolei,Yorelei,Hihú"
): Promise<void> {
  console.log("🧪 Testing publishMessage...");

  try {
    console.log(
      `📢 Publishing new audio message at lat: ${latitude}, long: ${longitude}...`
    );
    console.log(`📁 Using audio file: ${audioFilePath}`);
    console.log(`🏷️ With tags: ${tags}`);
    
    const response = await MessageService.publishMessage(
      audioFilePath,
      latitude,
      longitude,
      address,
      tags,
      "Test Device"
    );

    console.log("🔍 PublishMessage response:", response);

    if (response.success) {
      console.log(`✅ Message published successfully with ID: ${response.message?.id}`);
    } else {
      console.error("❌ Failed to publish message:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for posting a comment without audio
export async function testPostComment(
  messageId: string = "71707",
  text: string = "This is a test comment from the debug utility."
): Promise<void> {
  console.log("🧪 Testing postComment...");

  try {
    console.log(
      `💬 Posting comment on message ID: ${messageId}...`
    );
    console.log(`📝 Comment text: "${text}"`);
    
    const response = await MessageService.postComment(messageId, text);

    const { comments, ...responseMetadata } = response;
    console.log("🔍 PostComment response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Comment posted successfully`);
      if (response.comments && response.comments.length > 0) {
        console.log(`📝 Comment ID: ${response.comments[0].id}`);
      }
    } else {
      console.error("❌ Failed to post comment:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for recording that an audio was played
export async function testAudioPlayed(
  attachmentId: string = DEFAULT_ATTACHMENT_ID
): Promise<void> {
  console.log("🧪 Testing audioPlayed...");

  try {
    console.log(
      `🔊 Recording play of audio attachment ID: ${attachmentId}...`
    );
    
    const response = await MessageService.audioPlayed(attachmentId);

    console.log("🔍 AudioPlayed response:", response);

    if (response.success) {
      console.log(`✅ Audio play recorded successfully`);
    } else {
      console.error("❌ Failed to record audio play:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Add these to the setupDebugMessage function
export function setupDebugMessage(): void {
  // For React Native
  if (global) {
    // @ts-ignore - Add to global scope for console access
    global.debugMessage = {
      ...MessageService,
      testSearchPosts: testSearchMessages,
      testDeleteMessage,
      testUpdateMessage: testUpdateMessageTags,
      testPublishMessage,
      testPostComment,
      testAudioPlayed,
      // Add the new test functions
      testGetMessages,
      testGetMessagesByLocation: () => testGetMessages({
        lat: DEFAULT_LAT,
        long: DEFAULT_LONG,
        dist: "2000",
        description: "Messages near Barcelona"
      }),
      testGetMessagesByAuthor: () => testGetMessages({
        authorId: USER_ID,
        description: "My messages"
      }),
      testGetMessagesByTags: () => testGetMessages({
        tags: DEFAULT_TAGS,
        description: "Messages with specific tags"
      }),
      testGetMessagesByArea: () => testGetMessages({
        area: DEFAULT_AREA,
        description: "Messages in Barcelona area"
      }),
      testGetMessagesByAreaAndTags: () => testGetMessages({
        area: DEFAULT_AREA,
        tags: DEFAULT_TAGS,
        description: "Messages in Barcelona with specific tags"
      }),
    };
    
    console.log("🔧 Message debug functions initialized!");
    console.log("📱 Try these new test functions:");
    console.log("- debugMessage.testGetMessagesByLocation()");
    console.log("- debugMessage.testGetMessagesByAuthor()");
    console.log("- debugMessage.testGetMessagesByTags()");
    console.log("- debugMessage.testGetMessagesByArea()");
    console.log("- debugMessage.testGetMessagesByAreaAndTags()");
  }

  // For Web (if using Expo Web)
  if (typeof window !== "undefined") {
    window.debugMessage = {
        ...MessageService,
        testSearchPosts: testSearchMessages,
        testDeleteMessage,
        testUpdateMessage: testUpdateMessageTags,
        testPublishMessage,
        testPostComment,
        testAudioPlayed,
        // Add the new test functions
        testGetMessages,
        testGetMessagesByLocation: () => testGetMessages({
          lat: DEFAULT_LAT,
          long: DEFAULT_LONG,
          dist: "2000",
          description: "Messages near Barcelona"
        }),
        testGetMessagesByAuthor: () => testGetMessages({
          authorId: USER_ID,
          description: "My messages"
        }),
        testGetMessagesByTags: () => testGetMessages({
          tags: DEFAULT_TAGS,
          description: "Messages with specific tags"
        }),
        testGetMessagesByArea: () => testGetMessages({
          area: DEFAULT_AREA,
          description: "Messages in Barcelona area"
        }),
        testGetMessagesByAreaAndTags: () => testGetMessages({
          area: DEFAULT_AREA,
          tags: DEFAULT_TAGS,
          description: "Messages in Barcelona with specific tags"
        }),
      };
      
      console.log("🔧 Message debug functions initialized!");
      console.log("📱 Try these new test functions:");
      console.log("- debugMessage.testGetMessagesByLocation()");
      console.log("- debugMessage.testGetMessagesByAuthor()");
      console.log("- debugMessage.testGetMessagesByTags()");
      console.log("- debugMessage.testGetMessagesByArea()");
      console.log("- debugMessage.testGetMessagesByAreaAndTags()");
    }
}
