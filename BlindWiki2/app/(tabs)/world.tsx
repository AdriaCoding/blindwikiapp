import { StyleSheet, ScrollView } from "react-native";
import TagsView, { TagsList } from "@/components/TagsView";
import { useState } from "react";
import { RECORDINGS, AREAS } from "@/data/dummy-data";
import { Area } from "@/models/area";
import { Tag } from "@/models/tag";

export default function World() {
  
  function areaToTag(area: Area): Tag {
    return {
      id: area.id.toString(),
      name: area.displayName,
      asString: area.name
    };
  }
  const areasAsTags = AREAS.map((a) => areaToTag(a));
  const [selectedArea, setSelectedArea] = useState<Tag | null>(null);

  function chosenAreaHandler(area: Tag) {
    setSelectedArea(prev => prev?.id === area.id ? null : area);
  }

  const filteredRecordings = selectedArea
    ? RECORDINGS.filter((rec) => 
        rec.authorUser.currentArea.id.toString() === selectedArea.id
      )
    : [];

  return (
    <ScrollView style={styles.container}>
      <TagsList
        tags={areasAsTags}
        selectedTags={selectedArea ? [selectedArea] : []}
        onTagPress={chosenAreaHandler}
      />
      {filteredRecordings.length > 0 && (
        <TagsView messages={filteredRecordings} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 15,
  },
});
