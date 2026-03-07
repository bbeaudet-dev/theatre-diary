import { StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authClient, useSession } from "@/lib/auth-client";

export default function ProfileScreen() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.info}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.email}>{session?.user?.email ?? "Unknown"}</Text>
        {session?.user?.name && (
          <Text style={styles.name}>{session.user.name}</Text>
        )}
      </View>

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
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
    marginBottom: 24,
  },
  info: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
  },
  name: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  signOutButton: {
    padding: 14,
    backgroundColor: "#ff3b30",
    borderRadius: 10,
    alignItems: "center",
  },
  signOutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
