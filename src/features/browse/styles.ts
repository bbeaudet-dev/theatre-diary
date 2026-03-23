import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 10,
    fontSize: 15,
  },
  clearSearchButton: {
    marginLeft: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  clearSearchText: {
    fontSize: 16,
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  filterChips: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipActive: {},
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  countText: {
    fontSize: 13,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 8,
  },
  empty: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 48,
  },
  loadMoreButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: "600",
  },
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  cardTitles: { flex: 1, gap: 3 },
  showName: {
    fontSize: 16,
    fontWeight: "700",
  },
  theatre: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateRange: {
    fontSize: 12,
  },
  closingPill: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  closingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#b91c1c",
  },
});
