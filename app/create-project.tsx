import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { CheckCircle2, Calendar, ChevronLeft, ChevronRight } from "lucide-react-native";

// ─── Date helpers ──────────────────────────────────────────────────────────────
const MONTHS_FULL = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

/** Format "YYYY-MM-DD" → "Jan 4, 2026" */
function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS_FULL[(m || 1) - 1]?.slice(0, 3)} ${d}, ${y}`;
}

/** Calculate human-readable duration between two ISO date strings */
function calcDuration(startISO: string, endISO: string): string {
  const s = new Date(startISO);
  const e = new Date(endISO);
  let years  = e.getFullYear() - s.getFullYear();
  let months = e.getMonth()    - s.getMonth();
  let days   = e.getDate()     - s.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = e.getMonth() === 0 ? 11 : e.getMonth() - 1;
    const prevYear  = e.getMonth() === 0 ? e.getFullYear() - 1 : e.getFullYear();
    days += getDaysInMonth(prevMonth, prevYear);
  }
  if (months < 0) { years -= 1; months += 12; }

  const parts: string[] = [];
  if (years  > 0) parts.push(`${years} year${years   > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (days   > 0) parts.push(`${days} day${days       > 1 ? "s" : ""}`);
  return parts.length > 0 ? parts.join(" ") : "0 days";
}

// ─── Reusable single-date picker ───────────────────────────────────────────────
interface DatePickerFieldProps {
  label: string;
  placeholder: string;
  value: string;          // "YYYY-MM-DD"
  onChange: (v: string) => void;
  minDate?: string;       // "YYYY-MM-DD" — disallow earlier dates
}

function DatePickerField({ label, placeholder, value, onChange, minDate }: DatePickerFieldProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const [open, setOpen] = useState(false);
  const [pMonth, setPMonth] = useState(today.getMonth());
  const [pDay,   setPDay]   = useState(today.getDate());
  const [pYear,  setPYear]  = useState(currentYear);

  const openPicker = () => {
    if (value) {
      const [y, m, d] = value.split("-").map(Number);
      setPYear(y || currentYear);
      setPMonth((m || 1) - 1);
      setPDay(d || 1);
    } else {
      setPMonth(today.getMonth());
      setPDay(today.getDate());
      setPYear(currentYear);
    }
    setOpen(true);
  };

  const adjustMonth = (dir: 1 | -1) => setPMonth(m => (m + dir + 12) % 12);
  const adjustDay   = (dir: 1 | -1) => {
    const max = getDaysInMonth(pMonth, pYear);
    setPDay(d => { const n = d + dir; return n < 1 ? max : n > max ? 1 : n; });
  };
  const adjustYear  = (dir: 1 | -1) =>
    setPYear(y => { const n = y + dir; return n < currentYear ? currentYear : n > currentYear + 10 ? currentYear + 10 : n; });

  const handleDone = () => {
    const d   = Math.min(pDay, getDaysInMonth(pMonth, pYear));
    const iso = `${pYear}-${String(pMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (minDate && iso < minDate) {
      // silently clamp to minDate
      onChange(minDate);
    } else {
      onChange(iso);
    }
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity style={dfStyles.trigger} onPress={openPicker} activeOpacity={0.75}>
        <Calendar size={16} color={value ? "#282A32" : "#94A3B8"} />
        <View style={{ flex: 1 }}>
          <Text style={dfStyles.triggerLabel}>{label}</Text>
          <Text style={[dfStyles.triggerText, !value && dfStyles.placeholder]}>
            {value ? fmtDate(value) : placeholder}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={dfStyles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={dfStyles.card}>
            <Text style={dfStyles.title}>{label}</Text>
            {([
              { label: "Month", display: MONTHS_FULL[pMonth], onPrev: () => adjustMonth(-1), onNext: () => adjustMonth(1) },
              { label: "Day",   display: String(pDay).padStart(2, "0"),  onPrev: () => adjustDay(-1),   onNext: () => adjustDay(1) },
              { label: "Year",  display: String(pYear),                  onPrev: () => adjustYear(-1),  onNext: () => adjustYear(1) },
            ] as const).map(row => (
              <View key={row.label} style={dfStyles.row}>
                <Text style={dfStyles.rowLabel}>{row.label}</Text>
                <View style={dfStyles.controls}>
                  <TouchableOpacity style={dfStyles.arrowBtn} onPress={row.onPrev}>
                    <ChevronLeft size={18} color="#444751" />
                  </TouchableOpacity>
                  <Text style={dfStyles.value}>{row.display}</Text>
                  <TouchableOpacity style={dfStyles.arrowBtn} onPress={row.onNext}>
                    <ChevronRight size={18} color="#444751" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={dfStyles.footer}>
              <TouchableOpacity style={dfStyles.cancelBtn} onPress={() => setOpen(false)}>
                <Text style={dfStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={dfStyles.doneBtn} onPress={handleDone}>
                <Text style={dfStyles.doneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const dfStyles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    flex: 1,
  },
  triggerLabel: { fontSize: 10, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  triggerText: { fontSize: 14, color: "#1F293A", fontWeight: "600" },
  placeholder: { color: "#94A3B8", fontWeight: "400" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16 },
      android: { elevation: 10 },
    }),
  },
  title: { fontSize: 17, fontWeight: "800", color: "#1E293B", marginBottom: 20, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rowLabel: { fontSize: 13, fontWeight: "700", color: "#64748B", width: 52 },
  controls: { flexDirection: "row", alignItems: "center", flex: 1, justifyContent: "flex-end", gap: 12 },
  arrowBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  value: { fontSize: 15, fontWeight: "700", color: "#1E293B", minWidth: 80, textAlign: "center" },
  footer: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, height: 46, borderRadius: 12, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  cancelText: { fontSize: 15, fontWeight: "700", color: "#64748B" },
  doneBtn: { flex: 2, height: 46, borderRadius: 12, backgroundColor: "#282A32", justifyContent: "center", alignItems: "center" },
  doneText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
});
import ScreenHeader from "@/components/ScreenHeader";
import StripeWebModal from "@/components/StripeWebModal";
import { useRouter } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import { projectService } from "@/services/projectService";
import { stripeService } from "@/services/stripeService";
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
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Web-only Stripe modal state
  const [webStripeVisible, setWebStripeVisible] = useState(false);
  const [webClientSecret, setWebClientSecret] = useState("");
  const pendingPaymentIntentId = useRef("");

  const descriptionRef = useRef<TextInput>(null);
  const budgetRef = useRef<TextInput>(null);
  const locationRef = useRef<TextInput>(null);
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
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState("");     // YYYY-MM-DD
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

  // Called after payment succeeds on both web and native
  const createProjectAfterPayment = useCallback(async (paymentIntentId: string) => {
    try {
      setLoading(true);
      const projectData = {
        title: title.trim(),
        description: description.trim(),
        budget: budgetValue,
        currency: currency || "USD",
        location: location.trim() || undefined,
        category: category || undefined,
        duration: (startDate && endDate) ? calcDuration(startDate, endDate) : undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        paymentIntentId,
      };

      const newProject = await projectService.createProject(projectData);
      const budgetParam = encodeURIComponent(String(budgetValue));
      const currencyParam = encodeURIComponent(currency || "USD");
      // Show success modal BEFORE navigating away so it actually renders
      setShowSuccessModal(true);
      router.push(`/add-milestones?projectId=${newProject.id}&budget=${budgetParam}&currency=${currencyParam}`);
    } catch (error: any) {
      console.error("Failed to create project:", error);
      Alert.alert("Error", error.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  }, [title, description, budgetValue, currency, location, category, startDate, endDate, tagsArray, router]);

  // Called when web Stripe modal reports success
  const handleWebPaymentSuccess = useCallback(() => {
    setWebStripeVisible(false);
    setWebClientSecret("");
    createProjectAfterPayment(pendingPaymentIntentId.current);
  }, [createProjectAfterPayment]);

  const handleSubmit = async () => {
    setAttemptedSubmit(true);
    if (!title.trim()) return Alert.alert("Error", "Please enter a project title");
    if (!description.trim()) return Alert.alert("Error", "Please enter a project description");
    if (!budget.trim() || isNaN(parseFloat(budget))) return Alert.alert("Error", "Please enter a valid budget amount");
    if (parseFloat(budget) <= 0) return Alert.alert("Error", "Budget must be greater than 0");
    if (user?.role !== "Client") return Alert.alert("Error", "Only clients can create projects");

    try {
      setLoading(true);

      // Step 1: Create PaymentIntent on backend
      const { clientSecret, paymentIntentId } = await stripeService.createPaymentIntent(
        budgetValue,
        currency || "usd",
        user?.email
      );

      // ── Web: show Stripe Elements modal ──────────────────────────────────
      if (Platform.OS === "web") {
        pendingPaymentIntentId.current = paymentIntentId;
        setWebClientSecret(clientSecret);
        setWebStripeVisible(true);
        setLoading(false);
        return;
      }

      // ── Native: use stripe-react-native payment sheet ─────────────────────
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Freelancer App",
        returnURL: "myapp://stripe-redirect",
        defaultBillingDetails: { name: user?.userName ?? "" },
      });

      if (initError) {
        Alert.alert("Payment Error", initError.message);
        return;
      }

      // Keep loading=true through presentPaymentSheet so button stays disabled
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code !== "Canceled") {
          Alert.alert("Payment Failed", paymentError.message);
        }
        return;
      }

      // createProjectAfterPayment manages its own loading state internally
      await createProjectAfterPayment(paymentIntentId);
    } catch (error: any) {
      console.error("Failed to create project:", error);
      Alert.alert("Error", error.message || "Failed to create project");
    } finally {
      // Always reset loading — covers all early-return paths
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
              style={[styles.input, attemptedSubmit && !title.trim() && styles.inputError]}
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
              style={[styles.input, styles.textArea, attemptedSubmit && !description.trim() && styles.inputError]}
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
              style={[styles.input, attemptedSubmit && !isBudgetValid && styles.inputError]}
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

          {/* Location (autocomplete via Open-Meteo Geocoding API) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              ref={locationRef}
              style={styles.input}
              placeholder="Search city, e.g. Karachi"
              value={location}
              onChangeText={handleLocationChange}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
              onFocus={() => location.trim().length >= 2 && setShowLocationSuggestions(true)}
              returnKeyType="next"
              onSubmitEditing={() => tagsRef.current?.focus()}
            />
            {showLocationSuggestions && (
              <View style={styles.suggestionsContainer}>
                {locationSuggestionsLoading ? (
                  <View style={styles.suggestionItem}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.suggestionLoadingText}>Searching locations...</Text>
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

          {/* Project Duration (Start → End calendar pickers) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Project Duration</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <DatePickerField
                label="Start Date"
                placeholder="Select start"
                value={startDate}
                onChange={(v) => {
                  setStartDate(v);
                  // If end date is before new start date, clear it
                  if (endDate && v > endDate) setEndDate("");
                }}
              />
              <DatePickerField
                label="End Date"
                placeholder="Select end"
                value={endDate}
                onChange={setEndDate}
                minDate={startDate || undefined}
              />
            </View>
            {startDate && endDate && (
              <View style={styles.durationBadge}>
                <Text style={styles.durationBadgeText}>
                  Estimated: {calcDuration(startDate, endDate)}
                </Text>
              </View>
            )}
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
              <Text style={styles.submitButtonText}>Pay & Create Project</Text>
            )}
          </TouchableOpacity>

          {user?.role && user.role !== "Client" && (
            <Text style={styles.helperInfo}>
              Only Client accounts can create projects.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Web Stripe payment modal */}
      <StripeWebModal
        visible={webStripeVisible}
        clientSecret={webClientSecret}
        amount={budgetValue}
        currency={currency || "USD"}
        customerName={user?.userName ?? ""}
        customerEmail={user?.email ?? ""}
        onSuccess={handleWebPaymentSuccess}
        onCancel={() => {
          setWebStripeVisible(false);
          setWebClientSecret("");
          pendingPaymentIntentId.current = "";
        }}
      />

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
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
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
  durationBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    alignSelf: "flex-start",
  },
  durationBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0369A1",
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

