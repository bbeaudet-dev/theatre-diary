import { useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DetailCard, detailCardStyles } from "@/components/detail-card";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ShowDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ showId?: string; name?: string }>();
  const showId = (params.showId ?? "") as Id<"shows">;
  const title =
    typeof params.name === "string" && params.name.trim().length > 0
      ? params.name
      : "Show";

  const show = useQuery(api.shows.getById, showId ? { id: showId } : "skip");
  const visits = useQuery(api.visits.listByShow, showId ? { showId } : "skip");
  const productions = useQuery(api.productions.listByShow, showId ? { showId } : "skip");

  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const backgroundColor = Colors[theme].background;
  const mutedTextColor = Colors[theme].mutedText;
  const primaryTextColor = Colors[theme].text;
  // Use light accent here so the button isn't white-on-white in dark mode.
  const accentColor = Colors.light.accent;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={["bottom"]}>
      <Stack.Screen options={{ title, headerShown: true, headerBackButtonDisplayMode: "minimal" }} />

      <ScrollView contentContainerStyle={styles.content}>
        <DetailCard title="Show">
          <Text style={[detailCardStyles.value, { color: primaryTextColor }]}>{show?.name ?? "Loading..."}</Text>
          <Text style={[detailCardStyles.subtle, { color: mutedTextColor }]}>{show?.type ?? ""}</Text>
        </DetailCard>

        <DetailCard title="Your stats">
          <Text style={[detailCardStyles.value, { color: primaryTextColor }]}>{visits?.length ?? 0} visits</Text>
          <Text style={[detailCardStyles.subtle, { color: mutedTextColor }]}>{productions?.length ?? 0} productions available</Text>
        </DetailCard>

        <DetailCard title="Visits">
          {visits === undefined ? (
            <Text style={[detailCardStyles.subtle, { color: mutedTextColor }]}>Loading...</Text>
          ) : visits.length === 0 ? (
            <Text style={[detailCardStyles.subtle, { color: mutedTextColor }]}>No visits for this show yet.</Text>
          ) : (
            visits.map((visit) => (
              <Pressable
                key={visit._id}
                style={styles.visitRow}
                onPress={() =>
                  router.push({
                    pathname: "/visit/[visitId]",
                    params: { visitId: String(visit._id) },
                  })
                }
              >
                <Text style={[styles.visitRowText, { color: primaryTextColor }]}>{visit.date}</Text>
                <Text style={[styles.visitRowChevron, { color: mutedTextColor }]}>▸</Text>
              </Pressable>
            ))
          )}
        </DetailCard>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: accentColor }]}
          onPress={() => router.push("/add-visit")}
        >
          <Text style={[styles.primaryButtonText, { color: "#fff" }]}>Add a Visit</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 32 },
  visitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e8e8e8",
    paddingVertical: 10,
  },
  visitRowText: {
    fontSize: 14,
    fontWeight: "500",
  },
  visitRowChevron: {
    fontSize: 14,
  },
  primaryButton: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 6,
  },
  primaryButtonText: {
    fontWeight: "700",
    fontSize: 14,
  },
});
