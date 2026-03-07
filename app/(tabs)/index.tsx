import { useQuery } from "convex/react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/convex/_generated/api";

export default function RankingsScreen() {
  const rankedShows = useQuery(api.rankings.getRankedShows);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Rankings</Text>
      {rankedShows === undefined ? (
        <Text style={styles.subtitle}>Loading...</Text>
      ) : rankedShows.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No shows ranked yet.</Text>
          <Text style={styles.emptySubtext}>
            Add your first show to get started!
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {rankedShows.map((show, index) => (
            <View key={show._id} style={styles.showRow}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <View style={styles.showInfo}>
                <Text style={styles.showName}>{show.name}</Text>
                <Text style={styles.showType}>{show.type}</Text>
              </View>
              {show.tier && (
                <View
                  style={[
                    styles.tierBadge,
                    show.tier === "liked" && styles.tierLiked,
                    show.tier === "neutral" && styles.tierNeutral,
                    show.tier === "disliked" && styles.tierDisliked,
                  ]}
                >
                  <Text style={styles.tierText}>
                    {show.tier === "liked"
                      ? "👍"
                      : show.tier === "neutral"
                        ? "😐"
                        : "👎"}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  list: {
    marginTop: 16,
    gap: 8,
  },
  showRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  rank: {
    fontSize: 16,
    fontWeight: "bold",
    width: 40,
    color: "#333",
  },
  showInfo: {
    flex: 1,
  },
  showName: {
    fontSize: 16,
    fontWeight: "600",
  },
  showType: {
    fontSize: 12,
    color: "#888",
    textTransform: "capitalize",
    marginTop: 2,
  },
  tierBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  tierLiked: {
    backgroundColor: "#d4edda",
  },
  tierNeutral: {
    backgroundColor: "#fff3cd",
  },
  tierDisliked: {
    backgroundColor: "#f8d7da",
  },
  tierText: {
    fontSize: 16,
  },
});
