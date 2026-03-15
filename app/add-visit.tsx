import { useMutation, useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type ShowType = "musical" | "play" | "opera" | "dance" | "other";

const TYPE_LABELS: Record<ShowType, string> = {
  musical: "Musical",
  play: "Play",
  opera: "Opera",
  dance: "Dance",
  other: "Other",
};

const MAX_RESULTS = 10;

function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AddVisitScreen() {
  const router = useRouter();
  const allShows = useQuery(api.shows.list);
  const createVisit = useMutation(api.visits.createVisit);

  const [query, setQuery] = useState("");
  const [selectedShowId, setSelectedShowId] = useState<Id<"shows"> | null>(null);
  const [customShowName, setCustomShowName] = useState<string | null>(null);
  const [date, setDate] = useState(getTodayIsoDate());
  const [selectedProductionId, setSelectedProductionId] =
    useState<Id<"productions"> | null>(null);
  const [useOtherProduction, setUseOtherProduction] = useState(false);
  const [city, setCity] = useState("");
  const [theatre, setTheatre] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [keepCurrentRanking, setKeepCurrentRanking] = useState(true);

  const selectedShow = useMemo(
    () => allShows?.find((show) => show._id === selectedShowId) ?? null,
    [allShows, selectedShowId],
  );

  const showContext = useQuery(api.visits.getAddVisitContext, {
    showId: selectedShowId ?? undefined,
  });

  const productions = useQuery(
    api.productions.listByShow,
    selectedShowId ? { showId: selectedShowId } : "skip",
  );

  const productionOptions = productions ?? [];

  const filteredShows = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed || !allShows) return [];
    const lower = trimmed.toLowerCase();
    return allShows
      .filter((show) => show.name.toLowerCase().includes(lower))
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(lower);
        const bStarts = b.name.toLowerCase().startsWith(lower);
        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, MAX_RESULTS);
  }, [allShows, query]);

  const hasExactMatch = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return (
      lower.length > 0 &&
      filteredShows.some((show) => show.name.toLowerCase() === lower)
    );
  }, [filteredShows, query]);

  const hasSelectedShow = selectedShowId !== null || customShowName !== null;
  const showNameForHeader = selectedShow?.name ?? customShowName ?? "";
  const shouldShowRankingSection =
    hasSelectedShow && !(showContext?.hasRanking && keepCurrentRanking);

  const selectExistingShow = (showId: Id<"shows">) => {
    setSelectedShowId(showId);
    setCustomShowName(null);
    setQuery("");
    setSelectedProductionId(null);
    setUseOtherProduction(false);
    setCity("");
    setTheatre("");
    setKeepCurrentRanking(true);
  };

  const selectCustomShow = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setCustomShowName(trimmed);
    setSelectedShowId(null);
    setQuery("");
    setSelectedProductionId(null);
    setUseOtherProduction(true);
    setCity("");
    setTheatre("");
    setKeepCurrentRanking(false);
  };

  const clearSelection = () => {
    setSelectedShowId(null);
    setCustomShowName(null);
    setSelectedProductionId(null);
    setUseOtherProduction(false);
    setCity("");
    setTheatre("");
    setNotes("");
    setKeepCurrentRanking(true);
  };

  const handleSave = async () => {
    if (!hasSelectedShow || isSaving) return;
    setIsSaving(true);
    try {
      await createVisit({
        showId: selectedShowId ?? undefined,
        customShowName: customShowName ?? undefined,
        date: date.trim() || getTodayIsoDate(),
        productionId:
          useOtherProduction || !selectedProductionId
            ? undefined
            : selectedProductionId,
        city: useOtherProduction ? city.trim() || undefined : undefined,
        theatre: useOtherProduction ? theatre.trim() || undefined : undefined,
        notes: notes.trim() || undefined,
        keepCurrentRanking,
      });
      router.back();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add Visit</Text>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Show</Text>
            {hasSelectedShow ? (
              <View style={styles.selectedShowCard}>
                <Text style={styles.selectedShowLabel}>Selected</Text>
                <Text style={styles.selectedShowName}>{showNameForHeader}</Text>
                <Pressable onPress={clearSelection}>
                  <Text style={styles.changeShowText}>Change</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search all shows..."
                  style={styles.input}
                  autoFocus
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {query.trim().length > 0 && (
                  <View style={styles.resultsCard}>
                    {!hasExactMatch && (
                      <Pressable
                        style={styles.customShowRow}
                        onPress={selectCustomShow}
                      >
                        <Text style={styles.customShowText}>
                          Add {query.trim()} as custom show
                        </Text>
                      </Pressable>
                    )}
                    {filteredShows.length === 0 && hasExactMatch && (
                      <View style={styles.noResultsRow}>
                        <Text style={styles.noResultsText}>No matching shows</Text>
                      </View>
                    )}
                    {filteredShows.map((show) => (
                      <Pressable
                        key={show._id}
                        style={styles.resultRow}
                        onPress={() => selectExistingShow(show._id)}
                      >
                        <Text style={styles.resultName}>{show.name}</Text>
                        <Text style={styles.resultType}>
                          {TYPE_LABELS[show.type]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>

          {hasSelectedShow && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Visit Date</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Production / Location</Text>
                {selectedShowId ? (
                  <>
                    {productions === undefined ? (
                      <ActivityIndicator size="small" color="#999" />
                    ) : (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.productionRow}
                      >
                        {productionOptions.map((production) => {
                          const selected =
                            selectedProductionId === production._id &&
                            !useOtherProduction;
                          const labelParts = [production.theatre];
                          if (production.city) labelParts.push(production.city);
                          return (
                            <Pressable
                              key={production._id}
                              style={[
                                styles.productionChip,
                                selected && styles.productionChipSelected,
                              ]}
                              onPress={() => {
                                setSelectedProductionId(production._id);
                                setUseOtherProduction(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.productionChipText,
                                  selected && styles.productionChipTextSelected,
                                ]}
                              >
                                {labelParts.join(" · ")}
                              </Text>
                            </Pressable>
                          );
                        })}
                        <Pressable
                          style={[
                            styles.productionChip,
                            useOtherProduction && styles.productionChipSelected,
                          ]}
                          onPress={() => {
                            setUseOtherProduction(true);
                            setSelectedProductionId(null);
                          }}
                        >
                          <Text
                            style={[
                              styles.productionChipText,
                              useOtherProduction &&
                                styles.productionChipTextSelected,
                            ]}
                          >
                            Other
                          </Text>
                        </Pressable>
                      </ScrollView>
                    )}
                  </>
                ) : (
                  <Text style={styles.helperText}>
                    Custom shows use the Other location details below.
                  </Text>
                )}
                {useOtherProduction && (
                  <View style={styles.otherForm}>
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                      placeholder="City (optional)"
                      autoCapitalize="words"
                    />
                    <TextInput
                      style={styles.input}
                      value={theatre}
                      onChangeText={setTheatre}
                      placeholder="Theatre / venue / movie / pro-shot (optional)"
                      autoCapitalize="words"
                    />
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ranking</Text>
                {showContext?.hasRanking && (
                  <Pressable
                    style={styles.keepCurrentRow}
                    onPress={() => setKeepCurrentRanking((prev) => !prev)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        keepCurrentRanking && styles.checkboxChecked,
                      ]}
                    >
                      {keepCurrentRanking && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.keepCurrentText}>Keep Current Ranking</Text>
                  </Pressable>
                )}
                {showContext?.hasVisit && (
                  <Text style={styles.helperText}>
                    You already have at least one visit saved for this show.
                  </Text>
                )}
                {shouldShowRankingSection && (
                  <View style={styles.rankingPlaceholder}>
                    <Text style={styles.placeholderTitle}>
                      Ranking flow coming soon
                    </Text>
                    <Text style={styles.helperText}>
                      For now, new shows are added to the bottom of your rankings.
                      If the show is already ranked, its current position stays the
                      same.
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any extra details..."
                  multiline
                />
              </View>

              <Pressable
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Saving..." : "Save Visit"}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e3e3e3",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  closeText: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "500",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d3d3d3",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  notesInput: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  selectedShowCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d3d3d3",
    borderRadius: 10,
    padding: 12,
    gap: 4,
    backgroundColor: "#f8f8ff",
  },
  selectedShowLabel: {
    fontSize: 12,
    color: "#777",
    fontWeight: "500",
  },
  selectedShowName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },
  changeShowText: {
    marginTop: 4,
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  resultsCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e1e1e1",
    borderRadius: 10,
    overflow: "hidden",
  },
  customShowRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f8f8ff",
  },
  customShowText: {
    color: "#007AFF",
    fontWeight: "500",
    fontSize: 14,
  },
  noResultsRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noResultsText: {
    color: "#999",
    fontSize: 14,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ededed",
    gap: 8,
  },
  resultName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#222",
  },
  resultType: {
    fontSize: 12,
    color: "#888",
  },
  productionRow: {
    gap: 8,
  },
  productionChip: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#cecece",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  productionChipSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  productionChipText: {
    fontSize: 13,
    color: "#444",
    fontWeight: "500",
  },
  productionChipTextSelected: {
    color: "#fff",
  },
  otherForm: {
    gap: 10,
  },
  helperText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  keepCurrentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#999",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkmark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  keepCurrentText: {
    fontSize: 14,
    color: "#222",
    fontWeight: "500",
  },
  rankingPlaceholder: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#dedede",
    backgroundColor: "#fafafa",
    padding: 12,
    gap: 6,
  },
  placeholderTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  saveButton: {
    borderRadius: 12,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    marginTop: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
