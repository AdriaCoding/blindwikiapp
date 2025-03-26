import React from "react";
import {
  View,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import StyledButton from "./StyledButton";
import { Message } from "@/models/message";
import Colors from "@/constants/Colors";

interface MessageActions {
  onListen?: (event: GestureResponderEvent) => void;
  onEditTags?: (event: GestureResponderEvent) => void;
  onDelete?: (event: GestureResponderEvent) => void;
  onViewComments?: (event: GestureResponderEvent) => void;
  onDirection?: (event: GestureResponderEvent) => void;
}

export default function MessageComponent({
  m,
  actions,
}: {
  m: Message;
  actions: MessageActions;
}) {
  return (
    <View style={styles.container}>
      {/* First line: tags */}
      <Text style={styles.tagsLine}>
        {m.tags.join(", ")}
      </Text>

      {/* Second line: userID in bold, then a dot, then location.
          The location can be multi-line if it's long */}
      <Text style={styles.lineTwo}>
        <Text style={styles.user}>{m.authorUser.id}</Text>. {m.address}
      </Text>

      {/* Black buttons for actions */}
      {actions.onListen && (
        <StyledButton title="Listen" onPress={actions.onListen} />
      )}
      {actions.onViewComments && (
        <StyledButton title="Comments" onPress={actions.onViewComments} />
      )}
      {actions.onEditTags && (
        <StyledButton title="Edit Tags" onPress={actions.onEditTags} />
      )}
      {actions.onDelete && (
        <StyledButton title="Delete" onPress={actions.onDelete} />
      )}
      {actions.onDirection && (
        <StyledButton title="Direction" onPress={actions.onDirection} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingVertical: 10,
  },
  tagsLine: {
    marginBottom: 6,
  },
  lineTwo: {
    marginBottom: 6,
  },
  user: {
    fontWeight: "bold",
  },
});
