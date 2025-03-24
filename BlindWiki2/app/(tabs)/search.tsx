import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { testGetNearbyPosts, testSearchPosts } from "@/utils/debugMessage";

export default function Search() {
  const testhandler = () => {
    testGetNearbyPosts();
    testSearchPosts();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.bigButton}
        onPress={testhandler}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>TEST</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
  },
  bigButton: {
    width: '100%',
    height: '80%',
    backgroundColor: '#000000',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  }
});