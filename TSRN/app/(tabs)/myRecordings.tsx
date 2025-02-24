import { View, StyleSheet } from 'react-native';
import { RECORDINGS } from '@/data/dummy-data';
import RecordingComponent from '@/components/Recording';

export default function MyRecordings () {
  return (
    <View>
      {RECORDINGS.map((rec) => (
        <RecordingComponent {...rec} key={rec.id} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({

});