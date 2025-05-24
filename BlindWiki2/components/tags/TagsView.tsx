import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { InstructionsText } from "../InstructionsText";
import MessageComponent, { useMessageActions, MessageActions } from "../MessageView";
import { Tag } from "@/models/tag";
import Colors from "@/constants/Colors";
import { Message } from "@/models/message";
import { TagsList } from "@/components/tags/TagsList";
import { useTranslation } from "react-i18next";
import CommentsModal from "../CommentsModal";

// Parent component: tracks the selected tags in one state.
export default function TagsView({ messages }: { messages: Message[] }) {
  const { t } = useTranslation();
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  
  // Asegurar que las etiquetas sean únicas por ID y prepararlas con selected = false
  const [availableTags, setAvailableTags] = useState<Tag[]>(() => {
    return messages.reduce((acc, message) => {
      message.tags.forEach((tag) => {
        if (!acc.some((t) => t.id === tag.id)) {
          acc.push({
            ...tag,
            selected: false,
          });
        }
      });
      return acc;
    }, [] as Tag[]);
  });

  // Utilizar el hook de acciones compartido
  const {
    getActionsForMessage,
    commentingMessage,
    isCommentsModalVisible,
    setIsCommentsModalVisible,
    refreshMessageComments
  } = useMessageActions(
    filteredMessages, 
    setFilteredMessages
  );

  // Filtrar las acciones para solo incluir onListen, onViewComments y onDirection
  const getLimitedActionsForMessage = (message: Message): MessageActions => {
    const allActions = getActionsForMessage(message);
    return {
      onListen: allActions.onListen,
      onViewComments: allActions.onViewComments,
      onDirection: allActions.onDirection,
      onViewTranscription: allActions.onViewTranscription,
      // Otras acciones se establecen como undefined
      onEditTags: undefined,
      onDelete: undefined
    };
  };

  const handleTagPress = (pressedTag: Tag) => {
    const updatedTags = availableTags.map((tag) =>
      tag.id === pressedTag.id ? { ...tag, selected: !tag.selected } : tag
    );
    setAvailableTags(updatedTags);

    // Filtrar mensajes basados en etiquetas seleccionadas
    const selectedTags = updatedTags.filter((tag) => tag.selected);
    if (selectedTags.length > 0) {
      const filtered = messages.filter((message) =>
        message.tags.some((messageTag) =>
          selectedTags.some((selectedTag) => selectedTag.id === messageTag.id)
        )
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages([]);
    }
  };

  return (
    <>
      <InstructionsText>
        {t("tags.filterInstructions")}
      </InstructionsText>

      {/* Tag display */}
      <TagsList tags={availableTags} onTagPress={handleTagPress} />

      <View style={styles.separator} />

      {/* Filtered messages */}
      {filteredMessages.map((message) => (
        <MessageComponent
          key={message.id}
          m={message}
          actions={getLimitedActionsForMessage(message)}
        />
      ))}

      {/* Modal para ver y añadir comentarios */}
      <CommentsModal
        visible={isCommentsModalVisible}
        onClose={() => setIsCommentsModalVisible(false)}
        message={commentingMessage}
        onCommentAdded={refreshMessageComments}
      />
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
