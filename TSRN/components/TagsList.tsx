import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

interface Tag {
  id: number;
  name: string;
}
// Tag component: displays one tag. Toggles between unselected and selected styles on press.
export function Tag({
  tag,
  onPress,
}: {
  tag: Tag;
  onPress: (id: number) => void;
}) {
  const [selected, setSelected] = useState(false);

  const handlePress = () => {
    setSelected(!selected);
    onPress(tag.id);
  };

  return (
    <TouchableOpacity
      style={[styles.tag, selected && styles.tagSelected]}
      onPress={handlePress}
    >
      <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
        {tag.name}
      </Text>
    </TouchableOpacity>
  );
}

// TagList component: displays all tags in a flexible row layout.
export default function TagsList({
  tags,
  onTagPress,
}: {
  tags: Tag[];
  onTagPress: (id: number) => void;
}) {
  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <Tag key={tag.id} tag={tag} onPress={onTagPress} />
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
