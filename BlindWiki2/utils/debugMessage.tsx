import * as MessageService from "@/services/messageService";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { Button, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";

// Create a global debug object to access message functions
declare global {
  interface Window {
    debugMessage: typeof MessageService & {
      testSearchPosts: (
        lat?: string,
        long?: string,
        searchTerm?: string
      ) => Promise<void>;
      testDeleteMessage: (messageId?: string) => Promise<void>;
      testGetMyMessages: () => Promise<void>;
      testGetPostsByTags: (
        lat?: string,
        long?: string,
        tags?: string
      ) => Promise<void>;
      testGetPostsByTagsInArea: (
        area?: string,
        tags?: string
      ) => Promise<void>;
      testGetPostsByTagSearch: (
        lat?: string,
        long?: string,
        tags?: string,
        sort?: string
      ) => Promise<void>;
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
const DEFAULT_MESSAGE_ID = "71706";
const DEFAULT_ATTACHMENT_ID = "88450";
const SAMPLE_AUDIO_PATH = "@/data/sample_audio.mp3";

// Test function for searching posts
export async function testSearchPosts(
  lat: string = DEFAULT_LAT,
  long: string = DEFAULT_LONG,
  searchTerm: string = "parc"
): Promise<void> {
  console.log("🧪 Testing searchPosts...");

  try {
    console.log(
      `🔍 Searching for posts with term: "${searchTerm}" near lat: ${lat}, long: ${long}...`
    );
    const response = await MessageService.searchPosts(lat, long, searchTerm);

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

// Test function for getting current user's messages
export async function testGetMyMessages(): Promise<void> {
  console.log("🧪 Testing getMyMessages...");

  try {
    console.log("👤 Fetching messages created by the current user...");
    const response = await MessageService.getMyMessages();

    const { messages, ...responseMetadata } = response;
    console.log("🔍 MyMessages response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Found ${response.messages.length} of your messages`);
      response.messages.forEach((msg, idx) => {
        console.log(
          `📝 Message ${idx + 1}: ID ${msg.id}, created on ${msg.dateTime}`
        );
      });
    } else {
      console.error("❌ Failed to fetch your messages:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for getting posts by tags
export async function testGetPostsByTags(
  lat: string = DEFAULT_LAT,
  long: string = DEFAULT_LONG,
  tags: string = DEFAULT_TAGS
): Promise<void> {
  console.log("🧪 Testing getPostsByTags...");

  try {
    console.log(
      `🔍 Finding posts with tags: "${tags}" near lat: ${lat}, long: ${long}...`
    );
    const response = await MessageService.getPostsByTags(lat, long, tags);

    const { messages, ...responseMetadata } = response;
    console.log("🔍 PostsByTags response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Found ${response.messages.length} messages with these tags`);
      response.messages.forEach((msg, idx) => {
        console.log(
          `📝 Message ${idx + 1}: ID ${msg.id}, by ${
            msg.authorUser?.displayName || "Unknown"
          }`
        );
      });
    } else {
      console.error("❌ Failed to fetch posts by tags:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for getting posts by tags in area
export async function testGetPostsByTagsInArea(
  area: string = DEFAULT_AREA,
  tags: string = DEFAULT_TAGS
): Promise<void> {
  console.log("🧪 Testing getPostsByTagsInArea...");

  try {
    console.log(
      `🔍 Finding posts with tags: "${tags}" in area: ${area}...`
    );
    const response = await MessageService.getPostsByTagsInArea(area, tags);

    const { messages, ...responseMetadata } = response;
    console.log("🔍 PostsByTagsInArea response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Found ${response.messages.length} messages in this area with these tags`);
      response.messages.forEach((msg, idx) => {
        console.log(
          `📝 Message ${idx + 1}: ID ${msg.id}, by ${
            msg.authorUser?.displayName || "Unknown"
          }`
        );
      });
    } else {
      console.error("❌ Failed to fetch posts by tags in area:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for getting posts by tag search
export async function testGetPostsByTagSearch(
  lat: string = DEFAULT_LAT,
  long: string = DEFAULT_LONG,
  tags: string = DEFAULT_TAGS,
  sort: string = "0"
): Promise<void> {
  console.log("🧪 Testing getPostsByTagSearch...");

  try {
    console.log(
      `🔍 Finding posts with tags: "${tags}" near lat: ${lat}, long: ${long}, sort: ${sort}...`
    );
    const response = await MessageService.getPostsByTagSearch(lat, long, tags, sort);

    const { messages, ...responseMetadata } = response;
    console.log("🔍 PostsByTagSearch response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Found ${response.messages.length} messages with tag search`);
      response.messages.forEach((msg, idx) => {
        console.log(
          `📝 Message ${idx + 1}: ID ${msg.id}, by ${
            msg.authorUser?.displayName || "Unknown"
          }`
        );
      });
    } else {
      console.error("❌ Failed to fetch posts by tag search:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for updating a message
export async function testUpdateMessage(
  messageId: string = DEFAULT_MESSAGE_ID,
  tags: string = DEFAULT_TAGS
): Promise<void> {
  console.log("🧪 Testing updateMessage...");

  try {
    console.log(
      `✏️ Updating message ID: ${messageId} with tags: "${tags}"...`
    );
    const response = await MessageService.updateMessage(messageId, tags);

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
  tags: string = "test,audio,debug"
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

// Test function for posting a comment
export async function testPostComment(
  messageId: string = DEFAULT_MESSAGE_ID,
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

// Export function to setup debug message functions
export function setupDebugMessage(): void {
  // For React Native
  if (global) {
    // @ts-ignore - Add to global scope for console access
    global.debugMessage = {
      ...MessageService,
      testSearchPosts,
      testDeleteMessage,
      testGetMyMessages,
      testGetPostsByTags,
      testGetPostsByTagsInArea,
      testGetPostsByTagSearch,
      testUpdateMessage,
      testPublishMessage,
      testPostComment,
      testAudioPlayed,
    };
  }

  // For Web (if using Expo Web)
  if (typeof window !== "undefined") {
    window.debugMessage = {
      ...MessageService,
      testSearchPosts,
      testDeleteMessage,
      testGetMyMessages,
      testGetPostsByTags,
      testGetPostsByTagsInArea,
      testGetPostsByTagSearch,
      testUpdateMessage,
      testPublishMessage,
      testPostComment,
      testAudioPlayed,
    };
  }
}
