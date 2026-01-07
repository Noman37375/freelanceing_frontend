import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { API_BASE_URL } from "@/config";

export default function BidNow() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [projectTitle, setProjectTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/projects/${id}`);
        setProjectTitle(res.data.title || "");
      } catch (err) {
        console.error("Failed to fetch project for bidding", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleSubmit = async () => {
    if (!id) return Alert.alert("Missing project ID");
    if (!amount || !coverLetter) return Alert.alert("Please enter amount and cover letter");

    try {
      setSubmitting(true);
      const payload = { amount, coverLetter, duration };
      await axios.post(`${API_BASE_URL}/projects/${id}/bid`, payload);

      Alert.alert("Success", "Your bid has been submitted.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error("Bid error", err);
      Alert.alert("Error", err.response?.data?.message || "Unable to submit bid");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.heading}>Bid on Project</Text>
          <View style={{ width: 24 }} /> {/* spacer for alignment */}
        </View>

        <View style={styles.card}>
          <Text style={styles.projectTitle}>{projectTitle || "Project"}</Text>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Your Bid Amount (USD)</Text>
            <TextInput
              placeholder="e.g. 500"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Estimated Duration</Text>
            <TextInput
              placeholder="e.g. 2 weeks"
              value={duration}
              onChangeText={setDuration}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Cover Letter</Text>
            <TextInput
              placeholder="Write a short proposal to the client"
              value={coverLetter}
              onChangeText={setCoverLetter}
              style={[styles.input, { height: 120, textAlignVertical: "top" }]}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>🚀 Place Bid</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40, backgroundColor: "#F2F4F7" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  heading: { flex: 1, textAlign: "center", fontSize: 24, fontWeight: "700", color: "#111827" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  projectTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, color: "#1F2937" },
  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#F9FAFB",
    fontSize: 14,
    color: "#111827",
  },
  submitBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
