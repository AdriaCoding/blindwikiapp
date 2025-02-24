import { View, StyleSheet } from "react-native";
import { RECORDINGS } from "@/data/dummy-data";
import RecordingComponent from "@/components/Recording";

const myRecordingsActions = {
  onListen: () => console.log("Listen"),
  onEditTags: () => console.log("Edit Tags"),
  onDelete: () => console.log("Delete"),
  onViewComments: undefined,
  onDirection: undefined,
};

export default function MyRecordings() {
  return (
    <View style={styles.container}>
      {RECORDINGS.map((recording) => (
        <RecordingComponent
          r={recording}
          key={recording.id}
          actions={myRecordingsActions}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    marginVertical: 10,
  },
});
