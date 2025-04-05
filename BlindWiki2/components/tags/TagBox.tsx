import React from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { Tag } from "@/models/tag";
import Colors from "@/constants/Colors";

interface TagBoxProps {
  tag: Tag;
  onPress: (tag: Tag) => void;
}

export default function TagBox({ tag, onPress }: TagBoxProps) {
  return (
    <TouchableOpacity
      style={[styles.tag, tag.selected && styles.tagSelected]}
      onPress={() => onPress(tag)}
    >
      <Text style={[styles.tagText, tag.selected && styles.tagTextSelected]}>
        {tag.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderColor: Colors.light.tag.border,
    backgroundColor: Colors.light.tag.background,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
    margin: 4,
  },
  tagSelected: {
    backgroundColor: Colors.light.tag.activeBackground,
  },
  tagText: {
    color: Colors.light.tag.text,
  },
  tagTextSelected: {
    color: Colors.light.tag.activeText,
  },
}); 