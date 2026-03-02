import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Modal,
} from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import ScreenHeader from "@/components/ScreenHeader";
import { useRouter } from "expo-router";
import { projectService } from "@/services/projectService";
import { adminService } from "@/services/adminService";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "@/utils/constants";
import {
  searchLocationsDebounced,
  type LocationSuggestion,
} from "@/services/locationService";
import {
  fetchCurrencies,
  filterCurrencies,
  type CurrencyItem,
} from "@/services/currencyService";

export default function CreateProjectScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const descriptionRef = useRef<TextInput>(null);
  const budgetRef = useRef<TextInput>(null);
  const locationRef = useRef<TextInput>(null);
  const durationRef = useRef<TextInput>(null);
  const tagsRef = useRef<TextInput>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState<string>("USD");
  const [currencySearch, setCurrencySearch] = useState("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");
  const [tagsArray, setTagsArray] = useState<string[]>([]);

  // Location autocomplete (LinkedIn-style)
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestionsLoading, setLocationSuggestionsLoading] = useState(false);

  // Categories from backend (service_categories)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await adminService.getServiceCategories();
        if (!cancelled) setCategories(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCurrencies();
        if (!cancelled) setCurrencies(list);
      } catch {
        if (!cancelled) setCurrencies([]);
      } finally {
        if (!cancelled) setCurrenciesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const budgetValue = useMemo(() => parseFloat(budget), [budget]);
  const isBudgetValid = Number.isFinite(budgetValue) && budgetValue > 0;
  const isFormValid = title.trim().length > 0 && description.trim().length > 0 && isBudgetValid;
  const canSubmit = !loading && isFormValid && user?.role === "Client";

  // Convert tags string to array
  const handleTagsChange = (text: string) => {
    setTags(text);
    const tagList = text
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    setTagsArray(tagList);
  };

  const handleBudgetChange = (text: string) => {
    // Keep only digits and '.' (simple, mobile-friendly)
    const sanitized = text.replace(/[^0-9.]/g, "");
    setBudget(sanitized);
  };

  const handleLocationChange = (text: string) => {
    setLocation(text);
    if (text.trim().length < 2) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }
    setLocationSuggestionsLoading(true);
    setShowLocationSuggestions(true);
    searchLocationsDebounced(
      text,
      (suggestions) => {
        setLocationSuggestionsLoading(false);
        setLocationSuggestions(suggestions);
      },
      () => setLocationSuggestionsLoading(false)
    );
  };

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.displayName);
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  };

  const filteredCurrencies = filterCurrencies(currencies, currencySearch);
  const selectedCurrencyLabel = (() => {
    const found = currencies.find((c) => c.code === currency);
    if (found) return found.displayLabel;
    try {
      const name = new Intl.DisplayNames(["en"], { type: "currency" }).of(currency);
      return `${currency} – ${name ?? currency}`;
    } catch {
      return currency;
    }
  })();

  const handleSelectCurrency = (item: CurrencyItem) => {
    setCurrency(item.code);
    setCurrencySearch("");
    setShowCurrencyDropdown(false);
  };

  const handleSubmit = async () => {
    setAttemptedSubmit(true);
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
        budget: budgetValue,
        currency: currency || "USD",
        location: location.trim() || undefined,
        category: category || undefined,
        duration: duration.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      };

      await projectService.createProject(projectData);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Failed to create project:", error);
      Alert.alert("Error", error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScreenHeader title="Create Project" showBackButton />

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
              returnKeyType="next"
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />
            {attemptedSubmit && title.trim().length === 0 && (
              <Text style={styles.helperError}>Title is required.</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              ref={descriptionRef}
              style={[styles.input, styles.textArea]}
              placeholder="Describe your project in detail..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            {attemptedSubmit && description.trim().length === 0 && (
              <Text style={styles.helperError}>Description is required.</Text>
            )}
          </View>

          {/* Budget + Currency (searchable dropdown from API) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Budget *</Text>
            <TouchableOpacity
              style={styles.currencyTrigger}
              onPress={() => setShowCurrencyDropdown((v) => !v)}
              activeOpacity={0.8}
            >
              {currenciesLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.currencyTriggerText} numberOfLines={1}>
                  {selectedCurrencyLabel}
                </Text>
              )}
            </TouchableOpacity>
            {showCurrencyDropdown && (
              <View style={styles.currencyDropdown}>
                <TextInput
                  style={styles.currencySearchInput}
                  placeholder="Search currency (e.g. USD, PKR)"
                  placeholderTextColor={COLORS.gray500}
                  value={currencySearch}
                  onChangeText={setCurrencySearch}
                  autoFocus
                />
                <ScrollView style={styles.currencyList} keyboardShouldPersistTaps="handled">
                  {filteredCurrencies.length === 0 ? (
                    <View style={styles.suggestionItem}>
                      <Text style={styles.suggestionEmptyText}>
                        {currenciesLoading ? "Loading…" : "No currencies found"}
                      </Text>
                    </View>
                  ) : (
                    filteredCurrencies.map((c) => (
                      <TouchableOpacity
                        key={c.code}
                        style={[styles.suggestionItem, currency === c.code && styles.currencyItemActive]}
                        onPress={() => handleSelectCurrency(c)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.suggestionText} numberOfLines={1}>
                          {c.displayLabel}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
            <TextInput
              ref={budgetRef}
              style={styles.input}
              placeholder="e.g. 500"
              value={budget}
              onChangeText={handleBudgetChange}
              keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
              returnKeyType="next"
              onSubmitEditing={() => locationRef.current?.focus()}
            />
            {attemptedSubmit && !isBudgetValid && (
              <Text style={styles.helperError}>Enter a budget greater than 0.</Text>
            )}
          </View>

          {/* Category */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Category</Text>
            {categoriesLoading ? (
              <View style={styles.categoryLoading}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.categoryLoadingText}>Loading categories…</Text>
              </View>
            ) : categories.length === 0 ? (
              <Text style={styles.helperInfo}>No categories available. Add them in Admin → Manage Service Categories.</Text>
            ) : (
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      category === cat.name && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat.name)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        category === cat.name && styles.categoryTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Location (LinkedIn-style autocomplete) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              ref={locationRef}
              style={styles.input}
              placeholder="e.g. Karachi, Lahore, Islamabad"
              value={location}
              onChangeText={handleLocationChange}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
              onFocus={() => location.trim().length >= 2 && setShowLocationSuggestions(true)}
              returnKeyType="next"
              onSubmitEditing={() => durationRef.current?.focus()}
            />
            {showLocationSuggestions && (
              <View style={styles.suggestionsContainer}>
                {locationSuggestionsLoading ? (
                  <View style={styles.suggestionItem}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.suggestionLoadingText}>Searching...</Text>
                  </View>
                ) : locationSuggestions.length > 0 ? (
                  locationSuggestions.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectLocation(s)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.suggestionText} numberOfLines={1}>
                        {s.displayName}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : location.trim().length >= 2 ? (
                  <View style={styles.suggestionItem}>
                    <Text style={styles.suggestionEmptyText}>No locations found</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          {/* Estimated Duration (preset options like Location) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Estimated Duration</Text>
            <View style={styles.durationChipsRow}>
              {["1 week", "2 weeks", "1 month", "2 months", "3 months", "6 months", "1 year"].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationChip, duration === d && styles.durationChipActive]}
                  onPress={() => setDuration(duration === d ? "" : d)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.durationChipText, duration === d && styles.durationChipTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              ref={durationRef}
              style={[styles.input, styles.durationInput]}
              placeholder="Or type custom (e.g. 3 weeks)"
              value={duration}
              onChangeText={setDuration}
              returnKeyType="next"
              onSubmitEditing={() => tagsRef.current?.focus()}
            />
          </View>

          {/* Tags */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Skills/Tags (comma-separated)</Text>
            <TextInput
              ref={tagsRef}
              style={styles.input}
              placeholder="e.g. React Native, JavaScript, UI/UX"
              value={tags}
              onChangeText={handleTagsChange}
              returnKeyType="done"
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
            style={[
              styles.submitButton,
              (!canSubmit || loading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Create Project</Text>
            )}
          </TouchableOpacity>

          {user?.role && user.role !== "Client" && (
            <Text style={styles.helperInfo}>
              Only Client accounts can create projects.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success popup */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          router.replace("/(client-tabs)" as any);
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => {
            setShowSuccessModal(false);
            router.replace("/(client-tabs)" as any);
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalCard}
          >
            <CheckCircle2 size={56} color={COLORS.success} style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalMessage}>
              Project has been created successfully.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace("/(client-tabs)" as any);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
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
    color: COLORS.gray700,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.gray900,
  },
  currencyTrigger: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    minHeight: 48,
    justifyContent: "center",
  },
  currencyTriggerText: {
    fontSize: 16,
    color: COLORS.gray900,
  },
  currencyDropdown: {
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    maxHeight: 280,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currencySearchInput: {
    padding: 12,
    fontSize: 16,
    color: COLORS.gray900,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  currencyList: {
    maxHeight: 220,
  },
  currencyItemActive: {
    backgroundColor: COLORS.gray100,
  },
  helperError: {
    marginTop: 6,
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "700",
  },
  helperInfo: {
    marginTop: 12,
    color: COLORS.gray500,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
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
  categoryLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  categoryLoadingText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray700,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  durationChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  durationChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray700,
  },
  durationChipTextActive: {
    color: COLORS.white,
  },
  durationInput: {
    marginTop: 0,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primaryDark,
    fontWeight: "500",
  },
  suggestionsContainer: {
    marginTop: 4,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    maxHeight: 220,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    gap: 8,
  },
  suggestionText: {
    fontSize: 15,
    color: COLORS.gray900,
    flex: 1,
  },
  suggestionLoadingText: {
    fontSize: 14,
    color: COLORS.gray500,
  },
  suggestionEmptyText: {
    fontSize: 14,
    color: COLORS.gray500,
    fontStyle: "italic",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    minWidth: 280,
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.gray900,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

