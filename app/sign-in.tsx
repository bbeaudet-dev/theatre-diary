import { Redirect } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSocialAuth } from "@/hooks/use-social-auth";
import { useSession } from "@/lib/auth-client";

export default function SignInScreen() {
  const { data: session, isPending } = useSession();
  const { loading, signInWithGoogle, signInWithApple } = useSocialAuth();

  if (isPending) return null;
  if (session) return <Redirect href="/" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Theatre Diary</Text>
          <Text style={styles.subtitle}>
            The all-in-one app for theatre nerds.
          </Text>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.googleButton]}
            onPress={signInWithGoogle}
            disabled={loading}
          >
            <Text style={styles.googleButtonText}>
              {loading ? "Signing in..." : "Continue with Google"}
            </Text>
          </Pressable>

          {Platform.OS === "ios" && (
            <Pressable
              style={[styles.button, styles.appleButton]}
              onPress={signInWithApple}
              disabled={loading}
            >
              <Text style={styles.appleButtonText}>
                {loading ? "Signing in..." : "Continue with Apple"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  buttons: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  appleButton: {
    backgroundColor: "#000",
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
