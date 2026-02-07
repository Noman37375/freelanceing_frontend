import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Eye, EyeOff, User, Mail, Lock, Briefcase, UserCircle, CheckCircle2 } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING, SHADOWS } from "@/constants/theme";

export default function Signup() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<'Freelancer' | 'Client'>('Freelancer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
  });

  const router = useRouter();
  const { signup } = useAuth();

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setErrorMessage("");

    // Check password criteria
    setPasswordCriteria({
      minLength: text.length >= 6,
      hasUppercase: /[A-Z]/.test(text),
      hasNumber: /[0-9]/.test(text),
    });
  };

  const handleSignup = async () => {
    setErrorMessage("");

    if (!userName || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill all fields.");
      return;
    }

    if (userName.length < 3) {
      setErrorMessage("Username must be at least 3 characters.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      console.log('[Signup] Attempting signup for:', email, 'Role:', role);
      const response = await signup(userName, email, password, role);
      console.log('[Signup] Signup successful:', response);

      if (role === 'Freelancer') {
        router.replace({
          pathname: "/complete-profile",
          params: { email: email, userId: response.user.id },
        } as any);
      } else {
        router.push({
          pathname: "/verify-email",
          params: { email: email, userId: response.user.id },
        } as any);
      }
    } catch (error: any) {
      console.error('[Signup] Error:', error);
      let errorMsg = error.message || "Signup failed. Please try again.";

      if (errorMsg.includes("already exists") || errorMsg.includes("User exists") || errorMsg.includes("USER_EXISTS")) {
        errorMsg = "This email or username is already registered. Please use a different one.";
      } else if (errorMsg.includes("Network") || errorMsg.includes("timeout") || errorMsg.includes("Failed to fetch")) {
        errorMsg = "Connection error. Please check your internet connection.";
      } else if (errorMsg.includes("Missing") || errorMsg.includes("required") || errorMsg.includes("MISSING")) {
        errorMsg = "Please fill all required fields correctly.";
      }

      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logoText}>PAK FREELANCE</Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join to find projects or hire freelancers</Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.formContainer}>
            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'userName' && styles.inputWrapperFocused
              ]}>
                <User size={20} color={focusedInput === 'userName' ? COLORS.primary : COLORS.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="john_doe"
                  placeholderTextColor={COLORS.textTertiary}
                  value={userName}
                  onChangeText={(text) => {
                    setUserName(text);
                    setErrorMessage("");
                  }}
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('userName')}
                  onBlur={() => setFocusedInput(null)}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'email' && styles.inputWrapperFocused
              ]}>
                <Mail size={20} color={focusedInput === 'email' ? COLORS.primary : COLORS.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="name@email.com"
                  placeholderTextColor={COLORS.textTertiary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrorMessage("");
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'password' && styles.inputWrapperFocused
              ]}>
                <Lock size={20} color={focusedInput === 'password' ? COLORS.primary : COLORS.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="6+ characters"
                  placeholderTextColor={COLORS.textTertiary}
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? <EyeOff size={20} color={COLORS.textTertiary} /> : <Eye size={20} color={COLORS.textTertiary} />}
                </TouchableOpacity>
              </View>

              {/* Criteria */}
              {password.length > 0 && (
                <View style={styles.criteriaContainer}>
                  <View style={styles.criteriaItem}>
                    <CheckCircle2 size={14} color={passwordCriteria.minLength ? COLORS.primary : '#e2e8f0'} />
                    <Text style={[styles.criteriaText, passwordCriteria.minLength && styles.criteriaTextActive]}>6+ chars</Text>
                  </View>
                  <View style={styles.criteriaItem}>
                    <CheckCircle2 size={14} color={passwordCriteria.hasUppercase ? COLORS.primary : '#e2e8f0'} />
                    <Text style={[styles.criteriaText, passwordCriteria.hasUppercase && styles.criteriaTextActive]}>Uppercase</Text>
                  </View>
                  <View style={styles.criteriaItem}>
                    <CheckCircle2 size={14} color={passwordCriteria.hasNumber ? COLORS.primary : '#e2e8f0'} />
                    <Text style={[styles.criteriaText, passwordCriteria.hasNumber && styles.criteriaTextActive]}>Number</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'confirmPassword' && styles.inputWrapperFocused
              ]}>
                <Lock size={20} color={focusedInput === 'confirmPassword' ? COLORS.primary : COLORS.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Repeat password"
                  placeholderTextColor={COLORS.textTertiary}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setErrorMessage("");
                  }}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Role Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>I want to...</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleCard, role === 'Freelancer' && styles.roleCardActive]}
                  onPress={() => setRole('Freelancer')}
                  activeOpacity={0.9}
                >
                  <View style={styles.roleHeader}>
                    <Briefcase size={20} color={role === 'Freelancer' ? COLORS.primary : COLORS.textTertiary} />
                    {role === 'Freelancer' && <View style={styles.radioSelected} />}
                    {role !== 'Freelancer' && <View style={styles.radioUnselected} />}
                  </View>
                  <Text style={[styles.roleTitle, role === 'Freelancer' && styles.roleTitleActive]}>Work</Text>
                  <Text style={styles.roleDesc}>Offer services to clients</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleCard, role === 'Client' && styles.roleCardActive]}
                  onPress={() => setRole('Client')}
                  activeOpacity={0.9}
                >
                  <View style={styles.roleHeader}>
                    <UserCircle size={20} color={role === 'Client' ? COLORS.primary : COLORS.textTertiary} />
                    {role === 'Client' && <View style={styles.radioSelected} />}
                    {role !== 'Client' && <View style={styles.radioUnselected} />}
                  </View>
                  <Text style={[styles.roleTitle, role === 'Client' && styles.roleTitleActive]}>Hire</Text>
                  <Text style={styles.roleDesc}>Find talent for projects</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login" as any)}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.l,
  },
  header: {
    paddingTop: 40,
    marginBottom: SPACING.xl,
  },
  logoText: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  mainContent: {
    flex: 1,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  titleContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
    marginBottom: SPACING.s,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textTertiary,
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,
    borderWidth: 1,
    borderColor: COLORS.error,
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.s,
    marginBottom: SPACING.l,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.base,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: SPACING.l,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.background,
    marginBottom: SPACING.s,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: BORDER_RADIUS.l,
    paddingHorizontal: SPACING.m,
    height: 52,
    backgroundColor: COLORS.white,
    gap: 12,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    ...SHADOWS.glow,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.background,
    height: '100%',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  criteriaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.m,
    marginTop: SPACING.s,
    paddingLeft: SPACING.xs,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  criteriaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
  },
  criteriaTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.m,
    backgroundColor: COLORS.white,
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.m,
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 6,
    borderColor: COLORS.primary,
  },
  roleTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  roleTitleActive: {
    color: COLORS.primary,
  },
  roleDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: BORDER_RADIUS.l,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.m,
    ...SHADOWS.medium,
  },
  signupButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  footerText: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});


