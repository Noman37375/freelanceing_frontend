import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { projectService } from "@/services/projectService";
import { Project } from "@/models/Project";
import { useAuth } from "@/contexts/AuthContext";

export default function ProjectDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        console.log('Fetching project with ID:', id);
        const fetchedProject = await projectService.getProjectById(id);
        console.log('Fetched project:', fetchedProject);
        if (fetchedProject) {
          setProject(fetchedProject);
        } else {
          console.error('Project is null or undefined');
        }
      } catch (error: any) {
        console.error("Failed to fetch project:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        // Don't show alert, just set project to null so we can show the error message
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Project not found</Text>
          <Text style={styles.errorSubtext}>
            The project you're looking for doesn't exist or may have been removed.
          </Text>
          <TouchableOpacity 
            style={styles.backButtonStyle} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>{project.title}</Text>
          <Text style={styles.budget}>💰 ${project.budget}</Text>
          {project.duration && <Text style={styles.deadline}>🕒 {project.duration}</Text>}
          {project.client && <Text style={styles.client}>👤 {project.client.userName}</Text>}
          {project.location && <Text style={styles.location}>📍 {project.location}</Text>}
          <Text style={styles.status}>Status: {project.status}</Text>
          <Text style={styles.bidsCount}>Bids: {project.bidsCount}</Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{project.description}</Text>

          {project.tags && project.tags.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Skills/Tags Required</Text>
              <View style={styles.skillContainer}>
                {project.tags.map((tag: string, i: number) => (
                  <Text key={i} style={styles.skillTag}>{tag}</Text>
                ))}
              </View>
            </>
          )}

          {project.category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Text style={styles.category}>{project.category}</Text>
            </View>
          )}

          {/* Only show Bid button if user is a Freelancer and project is ACTIVE (no freelancer assigned yet) */}
          {user?.role === 'Freelancer' && project.status === 'ACTIVE' && !project.freelancerId && (
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => router.push(`/Bid-now?id=${project.id}` as any)}
            >
              <Text style={styles.applyButtonText}>🚀 Bid Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  backButton: { padding: 8 },
  scrollContent: { flex: 1 },
  card: { backgroundColor: "#FFFFFF", margin: 20, borderRadius: 12, padding: 20, elevation: 3 },
  title: { fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 8 },
  budget: { fontSize: 16, color: "#3B82F6", marginBottom: 4, fontWeight: "600" },
  deadline: { fontSize: 16, color: "#6B7280", marginBottom: 4 },
  client: { fontSize: 16, color: "#6B7280", marginBottom: 4 },
  location: { fontSize: 16, color: "#6B7280", marginBottom: 4 },
  status: { fontSize: 14, color: "#10B981", marginBottom: 4, fontWeight: "600" },
  bidsCount: { fontSize: 14, color: "#6B7280", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 6 },
  description: { fontSize: 16, color: "#374151", lineHeight: 22 },
  skillContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  skillTag: { backgroundColor: "#EFF6FF", color: "#2563EB", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 16, marginRight: 6, marginBottom: 6, fontSize: 14 },
  categoryContainer: { marginTop: 12 },
  category: { fontSize: 16, color: "#374151", fontWeight: "500" },
  applyButton: { backgroundColor: "#3B82F6", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginTop: 20 },
  applyButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" },
  loadingText: { marginTop: 12, color: "#6B7280", fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40, backgroundColor: "#F9FAFB" },
  errorText: { fontSize: 20, fontWeight: "600", color: "#374151", marginBottom: 12, textAlign: "center" },
  errorSubtext: { fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 24 },
  backButtonStyle: { backgroundColor: "#3B82F6", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
