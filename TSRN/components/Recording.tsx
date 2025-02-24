import { View, Text, StyleSheet } from "react-native";

interface Recording {
  id: string;
  tags: string[];
  user: {
    id: string;
    name: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  comments: string[];
  audioFileId: string; // Reference or ID for the audio file
}

export default function RecordingComponent(r: Recording) {
  return (
    <View>
      <Text>Recording ID: {r.id}</Text>
      <Text>Tags: {r.tags.join(", ")}</Text>
      <Text>User: {r.user.name}</Text>
      <Text>Location: {r.location.latitude}, {r.location.longitude}</Text>
      <Text>Comments: {r.comments.join(" | ")}</Text>
      <Text>Audio File ID: {r.audioFileId}</Text>
    </View>
  );
}