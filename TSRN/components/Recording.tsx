import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent } from "react-native";
import BWButton from "./BWButton";
interface Recording {
  id: string;
  tags: string[];
  user: {
    id: string;
    name: string;
  };
  location: string;
  comments: string[];
  audioFileId: string;
}



export default function RecordingComponent(r: Recording) {
  return (
    <View style={styles.container}>
      {/* First line: tags */}
      <Text style={styles.tagsLine}> {r.tags.join(", ")}</Text>

      {/* Second line: userID in bold, then a dot, then location.
          The location can be multi-line if it's long */}
      <Text style={styles.lineTwo}>
        <Text style={styles.user}>{r.user.id}</Text>. {r.location}
      </Text>

      {/* Black buttons for actions */}
      <BWButton title="Listen" onPress={() => {}} />
      <BWButton title="Edit Tags" onPress={() => {}} />
      <BWButton title="Delete" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: 10,
  },
  tagsLine: {
    marginBottom: 6,
  },
  lineTwo: {
    marginBottom: 6,
  },
  user: {
    fontWeight: "bold",
  }
});