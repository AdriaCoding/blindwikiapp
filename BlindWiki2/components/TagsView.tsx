import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { InstructionsText } from "./StyledText";
import MessageComponent from "./MessageView";
import { Tag } from "@/models/tag";
import Colors from "@/constants/Colors";
import { Message } from "@/models/message";

function TagBox({
  tag,
  onPress,
}: {
  tag: Tag;
  onPress: (tag: Tag) => void;
}) {
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

// TagsList component: lays out tags in a row; passes 'selected' state and onPress handler to each tag.
export function TagsList({
  tags,
  onTagPress,
}: {
  tags: Tag[];
  selectedTags?: Tag[]; // Mantenemos para compatibilidad con código existente
  onTagPress: (tag: Tag) => void;
}) {
  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <TagBox
          key={tag.id}
          tag={tag}
          onPress={onTagPress}
        />
      ))}
    </View>
  );
}

// Parent component: tracks the selected tags in one state.
export default function TagsView({
  messages,
}: {
  messages: Message[];
}) {
  // Asegurar que las etiquetas sean únicas por ID y prepararlas con selected = false
  const [availableTags, setAvailableTags] = useState<Tag[]>(() => {
    return messages.reduce((acc, message) => {
      message.tags.forEach(tag => {
        if (!acc.some(t => t.id === tag.id)) {
          acc.push({
            ...tag,
            selected: false
          });
        }
      });
      return acc;
    }, [] as Tag[]);
  });

  const handleTagPress = (pressedTag: Tag) => {
    setAvailableTags(prev => prev.map(tag => 
      tag.id === pressedTag.id 
        ? { ...tag, selected: !tag.selected } 
        : tag
    ));
  };

  // Filtramos mensajes basados en etiquetas con selected = true
  const selectedTags = availableTags.filter(tag => tag.selected);
  const filteredMessages = selectedTags.length > 0
    ? messages.filter((message) =>
        message.tags.some((messageTag) =>
          selectedTags.some((selectedTag) => selectedTag.id === messageTag.id)
        )
      )
    : [];

  return (
    <>
      <InstructionsText>
        Select any tags to display recordings that include at least one of them.
      </InstructionsText>

      {/* Tag display */}
      <TagsList
        tags={availableTags}
        onTagPress={handleTagPress}
      />

      <View style={styles.separator} />

      {/* Filtered messages */}
      {filteredMessages.map((message) => (
        <MessageComponent
          key={message.id}
          m={message}
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
