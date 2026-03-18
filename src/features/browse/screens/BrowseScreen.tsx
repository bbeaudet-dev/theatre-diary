import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductionCard } from "@/features/browse/components/ProductionCard";
import { useBrowseData } from "@/features/browse/hooks/useBrowseData";
import { styles } from "@/features/browse/styles";

type BrowseMode = "current" | "all";

const ALL_SHOWS_PAGE_SIZE = 100;

export default function BrowseScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<BrowseMode>("current");
  const [allShowsLimit, setAllShowsLimit] = useState(ALL_SHOWS_PAGE_SIZE);
  const isNavigatingRef = useRef(false);
  const { allProductions, sections, shows, currentCount, allCount } = useBrowseData(search);

  useEffect(() => {
    setAllShowsLimit(ALL_SHOWS_PAGE_SIZE);
  }, [search]);

  const isLoadingCurrent = allProductions === undefined;
  const isLoadingAll = shows === undefined;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search shows or theatres…"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.trim().length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearch("")}
              style={styles.clearSearchButton}
            >
              <Text style={styles.clearSearchText}>×</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterChips}>
          <Pressable
            style={[styles.filterChip, mode === "current" && styles.filterChipActive]}
            onPress={() => setMode("current")}
          >
            <Text
              style={[
                styles.filterChipText,
                mode === "current" && styles.filterChipTextActive,
              ]}
            >
              Current
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, mode === "all" && styles.filterChipActive]}
            onPress={() => setMode("all")}
          >
            <Text
              style={[
                styles.filterChipText,
                mode === "all" && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </Pressable>
        </View>
        <Text style={styles.countText}>
          {currentCount} current · {allCount} total
        </Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {mode === "current" ? (
          isLoadingCurrent ? (
            <Text style={styles.empty}>Loading…</Text>
          ) : sections.length === 0 ? (
            <Text style={styles.empty}>
              {search ? "No results." : "No current or upcoming productions yet."}
            </Text>
          ) : (
            sections.map((section) => (
              <View key={section.title}>
                <Text style={styles.sectionHeader}>{section.title}</Text>
                {section.data.map((production) => (
                  <ProductionCard
                    key={production._id}
                    production={production}
                    onPress={() => {
                      if (isNavigatingRef.current) return;
                      if (!production.show?._id) return;
                      isNavigatingRef.current = true;
                      router.push({
                        pathname: "/show/[showId]",
                        params: {
                          showId: String(production.show._id),
                          name: production.show?.name ?? "Show",
                        },
                      });
                      setTimeout(() => {
                        isNavigatingRef.current = false;
                      }, 500);
                    }}
                  />
                ))}
              </View>
            ))
          )
        ) : isLoadingAll ? (
          <Text style={styles.empty}>Loading…</Text>
        ) : !shows || shows.length === 0 ? (
          <Text style={styles.empty}>{search ? "No results." : "No shows yet."}</Text>
        ) : (
          <>
            {shows.slice(0, allShowsLimit).map((show) => (
              <Pressable
                key={show._id}
                style={styles.card}
                onPress={() => {
                  if (isNavigatingRef.current) return;
                  isNavigatingRef.current = true;
                  router.push({
                    pathname: "/show/[showId]",
                    params: {
                      showId: String(show._id),
                      name: show.name ?? "Show",
                    },
                  });
                  setTimeout(() => {
                    isNavigatingRef.current = false;
                  }, 500);
                }}
              >
                <Text style={styles.showName}>{show.name}</Text>
              </Pressable>
            ))}
            {shows.length > allShowsLimit && (
              <Pressable
                style={styles.loadMoreButton}
                onPress={() => setAllShowsLimit((prev) => prev + ALL_SHOWS_PAGE_SIZE)}
              >
                <Text style={styles.loadMoreText}>
                  Load more ({shows.length - allShowsLimit} remaining)
                </Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
