import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

// Tag component: displays one tag. Toggles between unselected and selected styles on press.
export function Tag({ text, onPress }: { text: string; onPress: (text: string) => void }) {
  const [selected, setSelected] = useState(false);

  const handlePress = () => {
    setSelected(!selected);
    onPress(text);
  };

  return (
    <TouchableOpacity
      style={[styles.tag, selected && styles.tagSelected]}
      onPress={handlePress}
    >
      <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

// TagList component: displays all tags in a flexible row layout.
export default function TagsList({ tags, onTagPress }: { tags: string[]; onTagPress: (text: string) => void }) {
  return (
    <View style={styles.container}>
      {tags.map((t) => (
        <Tag key={t} text={t} onPress={onTagPress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  tag: {
    borderColor: "#000",
    borderWidth: 1,
        paddingHorizontal: 4,
    paddingVertical: 2,
    margin: 4,
  },
  tagSelected: {
    backgroundColor: "#000",
  },
  tagText: {
    color: "#000",
  },
  tagTextSelected: {
    color: "#fff",
  },
});