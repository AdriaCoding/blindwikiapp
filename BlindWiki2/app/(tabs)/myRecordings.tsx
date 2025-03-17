import { ScrollView, StyleSheet } from "react-native";
import { RECORDINGS } from "@/data/dummy-data";
import RecordingComponent from "@/components/RecordingView";
import Colors from "@/constants/Colors";
const myRecordingsActions = {
  onListen: () => console.log("Listen"),
  onEditTags: () => console.log("Edit Tags"),
  onDelete: () => console.log("Delete"),
  onViewComments: undefined,
  onDirection: undefined,
};

export default function MyRecordings() {
  return (
    <ScrollView style={styles.container}>
      {RECORDINGS.map((recording) => (
        <RecordingComponent
          r={recording}
          key={recording.id}
          actions={myRecordingsActions}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    margin: 10,
  },
});
