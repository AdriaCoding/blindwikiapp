import { StyleSheet } from "react-native";
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

  return (
    <>
      <Location location={location()} />
      <InstructionsText>
        Tria les etiquetes dels següents botons, per tal d'escoltar els
        missatges corresponents en aquesta àrea.
      </InstructionsText>
      <TagsList tags={TAGS} onTagPress={tagPressHandler} />
      {selectedTags.length > 0 && <InstructionsText>Pepe</InstructionsText>}
    </>
  );
}
const styles = StyleSheet.create({});
