import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { projectService } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";

export default function CreateProjectScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");
  const [tagsArray, setTagsArray] = useState<string[]>([]);

  const categories = [
    "Design",
    "Development",
    "Writing",
    "Marketing",
    "Data",
    "Other",
  ];

  // Convert tags string to array
  const handleTagsChange = (text: string) => {
    setTags(text);
    const tagList = text
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    setTagsArray(tagList);
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      return Alert.alert("Error", "Please enter a project title");
    }
    if (!description.trim()) {
      return Alert.alert("Error", "Please enter a project description");
    }
    if (!budget.trim() || isNaN(parseFloat(budget))) {
      return Alert.alert("Error", "Please enter a valid budget amount");
    }
    if (parseFloat(budget) <= 0) {
      return Alert.alert("Error", "Budget must be greater than 0");
    }

    if (user?.role !== "Client") {
      return Alert.alert("Error", "Only clients can create projects");
    }

    try {
      setLoading(true);
      const projectData = {
        title: title.trim(),
        description: description.trim(),
        budget: parseFloat(budget),
        location: location.trim() || undefined,
        category: category || undefined,
        duration: duration.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      };

      const newProject = await projectService.createProject(projectData);

      Alert.alert("Success", "Project created successfully!", [
        {
          text: "OK",
          onPress: () => router.replace(`/project-details?id=${newProject.id}`),
        },
      ]);
    } catch (error: any) {
      console.error("Failed to create project:", error);
      Alert.alert("Error", error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Project</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Project Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mobile App Development"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your project in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Budget */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Budget (USD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
          </View>

          {/* Category */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Remote, Karachi, Lahore"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Duration */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Estimated Duration</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2 weeks, 1 month"
              value={duration}
              onChangeText={setDuration}
            />
          </View>

          {/* Tags */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Skills/Tags (comma-separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. React Native, JavaScript, UI/UX"
              value={tags}
              onChangeText={handleTagsChange}
            />
            {tagsArray.length > 0 && (
              <View style={styles.tagsContainer}>
                {tagsArray.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Create Project</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryButtonActive: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

