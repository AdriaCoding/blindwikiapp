import * as AreaService from "@/services/areaService";

// Create a global debug object to access tag functions
declare global {
  interface Window {
    debugArea: typeof AreaService & {
      testGetAreas: () => Promise<void>;
    };
  }
}

// Test function for getAreas
export async function testGetAreas(): Promise<void> {
  console.log("🧪 Testing getAreas...");

  try {
    console.log(`🔍 Fetching all available areas...`);
    
    const response = await AreaService.getAreas();

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
      ...AreaService,
      testGetAreas,
    };
    
    console.log("🔧 Tag debug functions initialized!");
    console.log("📱 Try these test functions:");
    console.log("- debugTag.testGetAreas()");
  }

  // For Web (if using Expo Web)
  if (typeof window !== "undefined") {
    window.debugArea = {
      ...AreaService,
      testGetAreas,
    };
    
    console.log("🔧 Tag debug functions initialized!");
    console.log("📱 Try these test functions:");
    console.log("- debugTag.testGetAreas()");
  }
}