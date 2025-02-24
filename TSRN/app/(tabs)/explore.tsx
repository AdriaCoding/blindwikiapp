import { StyleSheet, View, ScrollView} from "react-native";
import Location from "@/components/Location";
import { InstructionsText } from "@/components/StyledText";
import TagsList from "@/components/TagsList";
import { useState } from "react";
import RecordingComponent from "@/components/Recording";
import { TAGS, RECORDINGS } from "@/data/dummy-data";

const location = () => {
  return "C. de María Sevilla Diago, 15, San Blas-Canillejas, 28022 Madrid, España: Baixa Precisió del GPS";
};

export default function Explore() {
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const tagPressHandler = (id: number) => {
    setSelectedTags((prev) => {
      if (prev.includes(id)) {
        return prev.filter((t) => t !== id);
      }
      return [...prev, id];
    });
  };

  const filteredRecordings = RECORDINGS.filter((recording) =>
    recording.tags.some((tagId) => selectedTags.includes(tagId))
  );

  const exploreActions = {
    onListen: () => console.log("Listen"),
    onEditTags: undefined,
    onDelete: undefined,
    onViewComments: () => console.log("View Comments"),
    onDirection: () => console.log("Get Directions"),
  }
  return (
    <ScrollView>
      <Location location={location()} />
      <InstructionsText>
        Tria les etiquetes dels següents botons, per tal d'escoltar els
        missatges corresponents en aquesta àrea.
      </InstructionsText>
      <TagsList tags={TAGS} onTagPress={tagPressHandler}/>
      <View style={styles.separator}/>
      {filteredRecordings.map((recording) => (
        <RecordingComponent
          r={recording}
          key={recording.id}
          actions={exploreActions}
        />
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  separator: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
