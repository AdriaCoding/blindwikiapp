import { Tag } from "@/models/tag";
import { View, StyleSheet } from "react-native";
import TagBox from "@/components/tags/TagBox";
// TagsList component: lays out tags in a row; passes 'selected' state and onPress handler to each tag.
export function TagsList({
  tags,
  onTagPress,
}: {
  tags: Tag[];
  onTagPress: (tag: Tag) => void;
}) {
  return (
    <View style={styles.container}>
      {tags.map((tag) => (
        <TagBox key={tag.id} tag={tag} onPress={onTagPress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
});
