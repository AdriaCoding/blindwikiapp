import { StyleSheet, ScrollView } from "react-native";
import TagsView, { TagsList } from "@/components/TagsView";
import { useState } from "react";
import { RECORDINGS } from "@/data/dummy-data";
const cities = [
  {
    id: 0,
    name: "Barcelona",
  },
  {
    id: 1,
    name: "Madrid",
  },
];

export default function World() {
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  function chosenCityHandler(cityId: number) {
    setSelectedCity(cityId);
  }
  const filteredRecordings =
    selectedCity !== null
      ? RECORDINGS.filter((rec) => {
          if (selectedCity === 0) {
            return rec.location.includes("Barcelona");
          } else if (selectedCity === 1) {
            return rec.location.includes("Madrid");
          }
          return false;
        })
      : [];
  return (
    <ScrollView style={styles.container}>
      <TagsList
        tags={cities}
        selectedTags={selectedCity !== null ? [selectedCity] : []}
        onTagPress={chosenCityHandler}
      />
      <TagsView recordings={filteredRecordings} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    margin: 15,
  },
});
