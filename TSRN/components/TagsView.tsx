import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { InstructionsText } from "./StyledText";
import { TAGS } from "../data/dummy-data";
import RecordingComponent from "./Recording";
import Tag from "@/models/tag";
import Recording from "@/models/recording";

function TagBox({
  tag,
  selected,
  onPress,
}: {
  tag: Tag;
  selected: boolean;
  onPress: (id: number) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tag, selected && styles.tagSelected]}
      onPress={() => onPress(tag.id)}
    >
      <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
        {tag.name}
      </Text>
    </TouchableOpacity>
  );
}

// TagsList component: lays out tags in a row; passes 'selected' state and onPress handler to each tag.
function TagsList({
  tags,
  selectedTags,
  onTagPress,
}: {
  tags: Tag[];
  selectedTags: number[];
  onTagPress: (id: number) => void;
}) {
  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <TagBox
          key={tag.id}
          tag={tag}
          selected={selectedTags.includes(tag.id)}
          onPress={onTagPress}
        />
      ))}
    </View>
  );
}

// Parent component: tracks the selected tags in one state.
export default function TagsView({
  recordings,
}: {
  recordings: Recording[];
}) {
  const availableTags = TAGS.filter((tag) =>
    recordings.some((rec) => rec.tags.includes(tag.id))
  );
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const handleTagPress = (id: number) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
    );
  };

  const filteredRecordings = recordings.filter((rec) =>
    rec.tags.some((tagId) => selectedTags.includes(tagId))
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
        <RecordingComponent
          key={recording.id}
          r={recording}
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
  separator: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
