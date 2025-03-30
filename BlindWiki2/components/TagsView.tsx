import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { InstructionsText } from "./StyledText";
import { TAGS } from "../data/dummy-data";
import MessageComponent from "./MessageView";
import { Tag } from "@/models/tag";
import Recording from "@/models/recording";
import Colors from "@/constants/Colors";
import { Message } from "@/models/message";

function TagBox({
  tag,
  selected,
  onPress,
}: {
  tag: Tag;
  selected: boolean;
  onPress: (tag: Tag) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tag, selected && styles.tagSelected]}
      onPress={() => onPress(tag)}
    >
      <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
        {tag.name}
      </Text>
    </TouchableOpacity>
  );
}

// TagsList component: lays out tags in a row; passes 'selected' state and onPress handler to each tag.
export function TagsList({
  tags,
  selectedTags,
  onTagPress,
}: {
  tags: Tag[];
  selectedTags: Tag[];
  onTagPress: (tag: Tag) => void;
}) {
  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <TagBox
          key={tag.id}
          tag={tag}
          selected={selectedTags.includes(tag)}
          onPress={onTagPress}
        />
      ))}
    </View>
  );
}

// Parent component: tracks the selected tags in one state.
export default function TagsView({
  messages: messages,
}: {
  messages: Message[];
}) {
  const availableTags = messages.reduce((acc, message) => {
    return [...acc, ...message.tags];
  }, [] as Tag[]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const handleTagPress = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.find(t => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  const filteredRecordings = messages.filter((m) =>
    m.tags.some((id) => selectedTags.includes(id))
  );

  return (
    <>
      <InstructionsText>
        Select any tags to display recordings that include at least one of them.
      </InstructionsText>

      {/* Tag display */}
      <TagsList
        tags={availableTags}
        selectedTags={selectedTags}
        onTagPress={handleTagPress}
        />

      <View style={styles.separator} />

      {/* Filtered recordings */}
      {filteredRecordings.map((recording) => (
        <MessageComponent
        key={recording.id}
        m={recording}
        actions={{
          onListen: () => console.log("Listen"),
          onEditTags: undefined,
          onDelete: undefined,
          onViewComments: () => console.log("View Comments"),
          onDirection: () => console.log("Direction"),
        }}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
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
  separator: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
});
