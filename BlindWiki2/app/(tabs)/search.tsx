import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { testSearchMessages } from "@/utils/debugMessage";
import { getSessionToken } from "@/services/secureStorage";
import { getAllSecureItems } from "@/utils/debugAuth";
export default function Search() {
  const testhandler = async () => {
    try {
      const sessionId = await getSessionToken();
      getAllSecureItems();
      console.log('🔑 Session ID:', sessionId || 'No session ID found');
    } catch (error) {
      console.error('Error fetching session ID:', error);
    }

    testSearchMessages();
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