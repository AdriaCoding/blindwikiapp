import { StyleSheet, ScrollView} from "react-native";
import Location from "@/components/Location";
import { RECORDINGS } from "@/data/dummy-data";
import TagsView from "@/components/TagsView";


export default function Explore() {
  const filteredRecordings = RECORDINGS.filter((rec) => rec.id !== "rec2"); // Example: exclude "rec2"
  return (
    <ScrollView style={styles.container}>
      <Location/>
      <TagsView recordings={filteredRecordings}/>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    margin: 15,
  }
});
