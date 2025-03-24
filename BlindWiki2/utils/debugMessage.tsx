import * as MessageService from "@/services/messageService";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { Button, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";

// Create a global debug object to access message functions
declare global {
  interface Window {
    debugMessage: typeof MessageService & {
      testGetNearbyPosts: (
        lat: string,
        long: string,
        dist?: string
      ) => Promise<void>;
      testSearchPosts: (
        lat: string,
        long: string,
        searchTerm: string
      ) => Promise<void>;
      testDeleteMessage: (messageId: string) => Promise<void>;
    };
  }
}

const DEFAULT_LAT = "41.3925366";
const DEFAULT_LONG = "2.1226543";

// Test function for getting nearby posts
export async function testGetNearbyPosts(
  lat: string = DEFAULT_LAT,
  long: string = DEFAULT_LONG,
  dist: string = "20"
): Promise<void> {
  console.log("🧪 Testing getPosts...");

  try {
    console.log(
      `📍 Getting posts near lat: ${lat}, long: ${long}, dist: ${dist}m...`
    );
    const response = await MessageService.getPosts(lat, long, dist);
    const { messages, ...responseMetadata } = response;
    console.log("🔍 SearchPosts response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Found ${response.messages.length} messages nearby`);
      response.messages.forEach((msg, idx) => {
        console.log(
          `📝 Message ${idx + 1}: ID ${msg.id}, by ${
            msg.authorUser?.displayName || "Unknown"
          }`
        );
      });
    } else {
      console.error("❌ Failed to get posts:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for searching posts
export async function testSearchPosts(
  lat: string = DEFAULT_LAT,
  long: string = DEFAULT_LONG,
  searchTerm: string = "Carrer de Sant Antoni Maria Claret"
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
export async function testDeleteMessage(messageId: string): Promise<void> {
  console.log("🧪 Testing deleteMessage...");

  try {
    console.log(`🗑️ Attempting to delete message with ID: ${messageId}...`);
    const response = await MessageService.deleteMessage(messageId);

    console.log("🔍 DeleteMessage response:", response);

    if (response.success) {
      console.log("✅ Message deleted successfully");
    } else {
      console.error("❌ Failed to delete message:", response.errorMessage);
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
      testGetNearbyPosts,
      testSearchPosts,
      testDeleteMessage,
    };
  }

  // For Web (if using Expo Web)
  if (typeof window !== "undefined") {
    window.debugMessage = {
      ...MessageService,
      testGetNearbyPosts,
      testSearchPosts,
      testDeleteMessage,
    };
  }
}
