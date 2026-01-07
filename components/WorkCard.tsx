// WorkCard.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function WorkCard({ project, type }) {
  const router = useRouter();

  const handlePress = () => {
    console.log("Pressed card:", type, project.id); // 🔍 debug

    if (type === "active" || type === "inProgress") {
      // ✅ supports both "active" and "inProgress"
      router.push({
        pathname: "/active-details",
        params: { id: project.id },
      });
    } else if (type === "completed") {
      router.push({
        pathname: "/completed-details",
        params: { id: project.id },
      });
    } else if (type === "proposals") {
      router.push({
        pathname: "/proposal-details",
        params: { id: project.id },
      });
    }
  };

  const progress = project.progress || 0;
  const progressColor =
    project.status === "completed"
      ? "#16A34A"
      : project.status === "inProgress"
      ? "#2563EB"
      : "#9CA3AF";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <Text style={styles.title}>{project.title}</Text>
        <Text
          style={[
            styles.status,
            project.status === "completed"
              ? styles.completed
              : project.status === "inProgress"
              ? styles.active
              : styles.proposal,
          ]}
        >
          {project.status}
        </Text>
      </View>

      <Text style={styles.client}>{project.client}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Budget:</Text>
        <Text style={styles.value}>{project.budget}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Deadline:</Text>
        <Text style={styles.value}>{project.deadline}</Text>
      </View>

      {type === "active" || type === "inProgress" ? (
        <View style={styles.progressWrapper}>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${progress}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "600", color: "#111827", flex: 1 },
  status: { fontSize: 12, fontWeight: "500", textTransform: "capitalize" },
  active: { color: "#2563EB" },
  completed: { color: "#16A34A" },
  proposal: { color: "#6B7280" },
  client: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  label: { color: "#6B7280", fontSize: 13 },
  value: { color: "#111827", fontSize: 13, fontWeight: "500" },

  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    width: 35,
    textAlign: "right",
  },
});
