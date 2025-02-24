import { StyleSheet } from "react-native";
import Location from "@/components/Location";
import { InstructionsText } from "@/components/StyledText";
import TagsList from "@/components/TagsList";
import { useState } from "react";
import RecordingComponent from "@/components/Recording";

const location = () => {
  return "C. de María Sevilla Diago, 15, San Blas-Canillejas, 28022 Madrid, España: Baixa Precisió del GPS";
};
const mockupTags = [
  "bueno",
  "malo",
  "feo",
  "peligro",
  "canalaladnadfnaf",
  "antonomasia",
  "cochambredumbre",
  "peepepepepepepeep",
  "canallita",
];

export default function Explore() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tagPressHandler = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      return [...prev, tag];
    });
  };

  return (
    <>
      <Location location={location()} />
      <InstructionsText>
        Tria les etiquetes dels següents botons, per tal d'escoltar els
        missatges corresponents en aquesta àrea.
      </InstructionsText>
      <TagsList tags={mockupTags} onTagPress={tagPressHandler} />
      {selectedTags.length > 0 && <InstructionsText>Pepe</InstructionsText>}
    </>
  );
}
const styles = StyleSheet.create({});
