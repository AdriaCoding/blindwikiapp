import { StyleSheet, ScrollView} from "react-native";
import Location from "@/components/Location";
import { RECORDINGS } from "@/data/dummy-data";
import TagsView from "@/components/TagsView";

const location = () => {
  return "Carrer de Jordi Girona, 29, Edifici Nexus II, Les Corts, 08034 Barcelona";
};

export default function Explore() {
  const filteredRecordings = RECORDINGS.filter((rec) => rec.id !== "rec2"); // Example: exclude "rec2"
  return (
    <ScrollView>
      <Location location={location()} />
      <TagsView recordings={filteredRecordings}/>
    </ScrollView>
  );
}
const styles = StyleSheet.create({

});
