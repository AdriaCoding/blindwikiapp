import { View, StyleSheet } from 'react-native';
import { RECORDINGS } from '@/data/dummy-data';
import RecordingComponent from '@/components/Recording';

export default function MyRecordings () {
  return (
    <View style={styles.container}>
      {RECORDINGS.map((rec) => (
        <RecordingComponent {...rec} key={rec.id} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    marginVertical: 10,
  }
});