import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CloudScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Theatre Cloud</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Your playbill cloud will appear here once you've ranked some shows.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  placeholderText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    lineHeight: 24,
  },
});
