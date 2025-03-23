import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import StyledButton from "./StyledButton";
import { TAGS } from "@/data/dummy-data";
import Recording from "@/models/recording";
import Colors from "@/constants/Colors";

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
        {r.tags.map((id) => TAGS.find(tag => tag.id == id)?.name).join(", ")}
      </Text>

      {/* Second line: userID in bold, then a dot, then location.
          The location can be multi-line if it's long */}
      <Text style={styles.lineTwo}>
        <Text style={styles.user}>{r.user.id}</Text>. {r.location}
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
