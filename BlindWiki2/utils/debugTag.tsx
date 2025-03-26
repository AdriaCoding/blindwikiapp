import * as TagService from "@/services/tagService";
import { View, StyleSheet, Text, ScrollView } from "react-native";
import { Button, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { Tag } from "@/models/tag";
import { getAreas } from "@/services/areaService";

// Create a global debug object to access tag functions
declare global {
  interface Window {
    debugTag: typeof TagService & {
      testGetProposedTags: () => Promise<void>;
      testGetTags: (options?: {
        lat?: string;
        long?: string;
        area?: string;
        sort?: string;
        dist_init?: string;
        dist_max?: string;
        min_results?: string;
        description?: string;
      }) => Promise<void>;
      testGetNearbyTags: (
        lat?: string,
        long?: string,
        sort?: string,
        dist_init?: string,
        dist_max?: string
      ) => Promise<void>;
      testGetTagsByArea: (
        area?: string,
        sort?: string
      ) => Promise<void>;
      testGetAreas: () => Promise<void>;
    };
  }
}

const DEFAULT_LAT = "41.3925366";
const DEFAULT_LONG = "2.1226543";
const DEFAULT_AREA = "640"; // Barcelona area ID
const DEFAULT_SORT = "0";   // Sort by popularity
const DEFAULT_DIST_INIT = "200"; // 200 meters initial radius
const DEFAULT_DIST_MAX = "5000"; // 5 km maximum radius
const DEFAULT_MIN_RESULTS = "10"; // Get at least 10 tags

// Test function for getProposedTags
export async function testGetProposedTags(): Promise<void> {
  console.log("🧪 Testing getProposedTags...");

  try {
    console.log("🔍 Fetching proposed tags for new posts...");
    const response = await TagService.getProposedTags();

    const { tags, ...responseMetadata } = response;
    console.log("🔍 Response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Found ${tags.length} proposed tags`);
      
      // Log the first few tags
      tags.slice(0, 10).forEach((tag, idx) => {
        console.log(
          `🏷️ Tag ${idx + 1}: ID ${tag.id}, name: ${tag.name}`
        );
      });
    } else {
      console.error("❌ Failed to fetch proposed tags:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for getTags with various parameter combinations
export async function testGetTags(options: {
  lat?: string;
  long?: string;
  area?: string;
  sort?: string;
  dist_init?: string;
  dist_max?: string;
  min_results?: string;
  description?: string; // For better debug output
} = {}): Promise<void> {
  // Create a description based on the parameters
  const description = options.description || generateTestDescription(options);
  console.log(`🧪 Testing getTags: ${description}`);

  try {
    console.log(`🔍 Fetching tags with parameters:`, options);
    const response = await TagService.getTags(options);

    const { tags, ...responseMetadata } = response;
    console.log("🔍 Response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Found ${tags.length} tags`);
      
      // Log the first few tags
      tags.slice(0, 10).forEach((tag, idx) => {
        console.log(
          `🏷️ Tag ${idx + 1}: ID ${tag.id}, name: ${tag.name}`
        );
      });
      
      // Check if tags have any usage metrics (examining the first tag) 
      if (tags.length > 0) {
        // Log extra properties that may exist in the response but not in the interface
        const firstTag = tags[0];
        const extraProps = Object.keys(firstTag).filter(
          key => !['id', 'name', 'asString'].includes(key)
        );
        
        if (extraProps.length > 0) {
          console.log("ℹ️ Additional tag properties found:", extraProps);
          console.log("📊 First tag extended data:", 
            extraProps.reduce((obj, key) => {
              obj[key] = (firstTag as any)[key];
              return obj;
            }, {} as Record<string, any>)
          );
        }
      }
      
    } else {
      console.error("❌ Failed to fetch tags:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Helper function to generate a test description
function generateTestDescription(options: any): string {
  if (options.area) return `Tags in area ${options.area}`;
  if (options.lat && options.long) return `Tags near location (lat: ${options.lat}, long: ${options.long})`;
  return "Tags with custom parameters";
}

// Test function for getNearbyTags
export async function testGetNearbyTags(
  lat: string = DEFAULT_LAT,
  long: string = DEFAULT_LONG,
  sort: string = DEFAULT_SORT,
  dist_init: string = DEFAULT_DIST_INIT,
  dist_max: string = DEFAULT_DIST_MAX
): Promise<void> {
  console.log("🧪 Testing getNearbyTags...");

  try {
    console.log(
      `🔍 Fetching tags near lat: ${lat}, long: ${long} (radius: ${dist_init}m - ${dist_max}m)...`
    );
    
    const response = await TagService.getNearbyTags(lat, long, {
      sort,
      dist_init,
      dist_max,
      min_results: DEFAULT_MIN_RESULTS
    });

    const { tags, ...responseMetadata } = response;
    console.log("🔍 Response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Found ${tags.length} nearby tags`);
      
      // Log the first few tags
      tags.slice(0, 10).forEach((tag, idx) => {
        console.log(
          `🏷️ Tag ${idx + 1}: ID ${tag.id}, name: ${tag.name}`
        );
      });
    } else {
      console.error("❌ Failed to fetch nearby tags:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for getTagsByArea
export async function testGetTagsByArea(
  area_id: string = DEFAULT_AREA,
  sort: string = DEFAULT_SORT
): Promise<void> {
  console.log("🧪 Testing getTagsByArea...");

  try {
    console.log(`🔍 Fetching tags in area: ${area_id}...`);
    
    const response = await TagService.getTagsByArea(area_id, { sort });

    const { tags, ...responseMetadata } = response;
    console.log("🔍 Response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Found ${tags.length} tags in the area`);
      
      // Log the tags
      tags.forEach((tag, idx) => {
        console.log(
          `🏷️ Tag ${idx + 1}: ID ${tag.id}, name: ${tag.name}`
        );
      });
    } else {
      console.error("❌ Failed to fetch area tags:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Test function for getAreas
export async function testGetAreas(): Promise<void> {
  console.log("🧪 Testing getAreas...");

  try {
    console.log(`🔍 Fetching all available areas...`);
    
    const response = await getAreas();

    const { areas, ...responseMetadata } = response;
    console.log("🔍 Response metadata:", responseMetadata);

    if (response.success) {
      console.log(`✅ Found ${areas.length} areas`);
      
      // Log areas
      areas.forEach((area, idx) => {
        console.log(
          `🌍 Area ${idx + 1}: ID ${area.id}, name: ${area.displayName}, messages: ${area.message_count || 0}`
        );
      });
      
      // Show the areas with most content
      const sortedByMessages = [...areas]
        .filter(area => area.message_count !== undefined)
        .sort((a, b) => (Number(b.message_count) || 0) - (Number(a.message_count) || 0));
      
      if (sortedByMessages.length > 0) {
        console.log("📊 Most active areas:");
        sortedByMessages.slice(0, 5).forEach((area, idx) => {
          console.log(
            `   ${idx + 1}. ${area.displayName} (${area.message_count} messages)`
          );
        });
      }
    } else {
      console.error("❌ Failed to fetch areas:", response.errorMessage);
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error);
  }
}

// Export function to setup debug tag functions
export function setupDebugTag(): void {
  // For React Native
  if (global) {
    // @ts-ignore - Add to global scope for console access
    global.debugTag = {
      ...TagService,
      testGetProposedTags,
      testGetTags,
      testGetNearbyTags,
      testGetTagsByArea,
      testGetAreas,
    };
    
    console.log("🔧 Tag debug functions initialized!");
    console.log("📱 Try these test functions:");
    console.log("- debugTag.testGetProposedTags()");
    console.log("- debugTag.testGetNearbyTags()");
    console.log("- debugTag.testGetTagsByArea()");
    console.log("- debugTag.testGetAreas()");
    console.log("- debugTag.testGetTags({ lat: '41.3925', long: '2.1226', sort: '0' })");
  }

  // For Web (if using Expo Web)
  if (typeof window !== "undefined") {
    window.debugTag = {
      ...TagService,
      testGetProposedTags,
      testGetTags,
      testGetNearbyTags,
      testGetTagsByArea,
      testGetAreas,
    };
    
    console.log("🔧 Tag debug functions initialized!");
    console.log("📱 Try these test functions:");
    console.log("- debugTag.testGetProposedTags()");
    console.log("- debugTag.testGetNearbyTags()");
    console.log("- debugTag.testGetTagsByArea()");
    console.log("- debugTag.testGetAreas()");
    console.log("- debugTag.testGetTags({ lat: '41.3925', long: '2.1226', sort: '0' })");
  }
}