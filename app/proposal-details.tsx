import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { ArrowLeft } from "lucide-react-native";
import { API_BASE_URL } from "@/config";

/* ======================
   TYPES
====================== */
interface Milestone {
  title: string;
  duration: string;
  details: string;
  pricePKR: string;
  priceUSD: string;
}

interface Project {
  id: string;
  title: string;

  client: {
    name: string;
  };

  budgetMin: number;
  budgetMax: number;

  postedAt: string;
  deadline?: string;

  skills: string[];
  description: string;

  milestones?: Milestone[];
}

/* ======================
   FALLBACK PROJECT
====================== */
const STATIC_PROJECT: Project = {
  id: "static-1",
  title: "React Native Mobile App Development",
  client: { name: "Tech Startup" },
  budgetMin: 300,
  budgetMax: 600,
  postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  skills: ["React Native", "JavaScript", "API Integration", "UI/UX"],
  description:
    "Looking for an experienced React Native developer to build a scalable and modern mobile application.",
  milestones: [
    {
      title: "App UI Design",
      duration: "1 week",
      details: "Design screens and user flow",
      pricePKR: "50,000 PKR",
      priceUSD: "$180",
    },
    {
      title: "App Development",
      duration: "3 weeks",
      details: "Develop core features",
      pricePKR: "120,000 PKR",
      priceUSD: "$420",
    },
  ],
};

/* ======================
   HELPERS
====================== */
const timeAgo = (timestamp: string) => {
  const postedDate = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - postedDate.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return `${Math.floor(days / 7)} weeks ago`;
};

/* ======================
   COMPONENT
====================== */
export default function ProjectDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/projects/${id}`);
        const data = res.data;

        setProject({
          id: data.id ?? STATIC_PROJECT.id,
          title: data.title ?? STATIC_PROJECT.title,

          client: {
            name: data.client ?? STATIC_PROJECT.client.name,
          },

          budgetMin: data.budgetMin ?? STATIC_PROJECT.budgetMin,
          budgetMax: data.budgetMax ?? STATIC_PROJECT.budgetMax,

          postedAt: data.postedAt ?? STATIC_PROJECT.postedAt,
          deadline: data.deadline,

          skills: data.skills ?? STATIC_PROJECT.skills,
          description: data.description ?? STATIC_PROJECT.description,

          milestones: data.milestones ?? STATIC_PROJECT.milestones,
        });
      } catch {
        setProject(STATIC_PROJECT);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2563EB" />;
  }

  if (!project) return null;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Project Info */}
      <View style={styles.card}>
        <Text style={styles.title}>{project.title}</Text>

        <Text style={styles.info}>
          👤 Posted by <Text style={styles.bold}>{project.client.name}</Text>
        </Text>

        <Text style={styles.info}>
          💰 Budget:{" "}
          <Text style={styles.bold}>
            ${project.budgetMin} – ${project.budgetMax}
          </Text>
        </Text>

        <Text style={styles.info}>
          🕒 Posted: <Text style={styles.bold}>{timeAgo(project.postedAt)}</Text>
        </Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{project.description}</Text>

        <Text style={styles.sectionTitle}>Skills Required</Text>
        <View style={styles.skillContainer}>
          {project.skills.map((skill, i) => (
            <Text key={i} style={styles.skillTag}>
              {skill}
            </Text>
          ))}
        </View>

        {project.milestones && (
          <>
            <Text style={styles.sectionTitle}>Project Milestones</Text>
            {project.milestones.map((m, i) => (
              <View key={i} style={styles.milestoneCard}>
                <Text style={styles.milestoneTitle}>
                  {i + 1}. {m.title}
                </Text>
                <Text style={styles.milestoneDetail}>{m.details}</Text>
                <Text style={styles.milestoneDuration}>⏳ {m.duration}</Text>
                <Text style={styles.milestonePrice}>
                  {m.priceUSD} • {m.pricePKR}
                </Text>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => router.push(`/Bid-now?id=${project.id}`)}
        >
          <Text style={styles.applyButtonText}>🚀 Bid Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ======================
   STYLES
====================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  card: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 14,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 10 },
  info: { fontSize: 15, color: "#374151", marginBottom: 6 },
  bold: { fontWeight: "600", color: "#111827" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 6,
    color: "#111827",
  },
  description: { fontSize: 15, color: "#4B5563", lineHeight: 22 },
  skillContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  skillTag: {
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 14,
  },
  milestoneCard: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  milestoneTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  milestoneDetail: { fontSize: 14, color: "#374151", marginTop: 4 },
  milestoneDuration: { fontSize: 13, color: "#6B7280", marginTop: 4 },
  milestonePrice: { fontSize: 14, color: "#10B981", marginTop: 4 },
  applyButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  applyButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
