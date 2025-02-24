import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import BWButton from "./BWButton";
interface Recording {
  id: string;
  tags: {
    id: number;
    name: string;
  }[];
  user: {
    id: string;
    name: string;
  };
  location: string;
  comments: string[];
  audioFileId: string;
}

interface RecordingActions {
  onListen?: (event: GestureResponderEvent) => void;
  onEditTags?: (event: GestureResponderEvent) => void;
  onDelete?: (event: GestureResponderEvent) => void;
  onViewComments?: (event: GestureResponderEvent) => void;
  onDirection?: (event: GestureResponderEvent) => void;
}

export default function RecordingComponent({
  r,
  actions,
}: {
  r: Recording;
  actions: RecordingActions;
}) {
  return (
    <View style={styles.container}>
      {/* First line: tags */}
      <Text style={styles.tagsLine}>
        {r.tags.map((tag) => tag.name).join(", ")}
      </Text>

      {/* Second line: userID in bold, then a dot, then location.
          The location can be multi-line if it's long */}
      <Text style={styles.lineTwo}>
        <Text style={styles.user}>{r.user.id}</Text>. {r.location}
      </Text>

      {/* Black buttons for actions */}
      {actions.onListen && (
        <BWButton title="Listen" onPress={actions.onListen} />
      )}
      {actions.onViewComments && (
        <BWButton title="Comments" onPress={actions.onViewComments} />
      )}
      {actions.onEditTags && (
        <BWButton title="Edit Tags" onPress={actions.onEditTags} />
      )}
      {actions.onDelete && (
        <BWButton title="Delete" onPress={actions.onDelete} />
      )}
      {actions.onDirection && (
        <BWButton title="Direction" onPress={actions.onDirection} />
      )}
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
  },
});
