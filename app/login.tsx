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
import { Eye, EyeOff, Lock, Mail, Briefcase, UserCircle } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { useAuth } from "@/contexts/AuthContext";
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING, SHADOWS } from "@/constants/theme";
import { RoleSelectionRequired } from "@/services/authService";
import authService, { Requires2FA } from "@/services/authService";

type Step = 'credentials' | 'role-select' | '2fa-verify';

export default function Login() {
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  // Role selection state
  const [pendingRoleData, setPendingRoleData] = useState<RoleSelectionRequired | null>(null);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  // 2FA state
  const [pending2FAEmail, setPending2FAEmail] = useState("");
  const [preAuthToken, setPreAuthToken] = useState("");
  const [twoFAOtp, setTwoFAOtp] = useState("");
  const [twoFAError, setTwoFAError] = useState("");

  const router = useRouter();
  const { login, loginWithRole } = useAuth();

  const clearFieldErrors = () => {
    setEmailError("");
    setPasswordError("");
  };

  const handleLogin = async () => {
    clearFieldErrors();

    let hasError = false;
    if (!email.trim()) {
      setEmailError("Email is required.");
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address.");
        hasError = true;
      }
    }
    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    }
    if (hasError) return;

    setIsLoading(true);

    try {
      console.log('[Login] Attempting login for:', email);
      const result = await login(email, password);

      // 2FA required — show OTP screen before role selection
      if (result && 'requires2FA' in result && result.requires2FA) {
        setPending2FAEmail((result as Requires2FA).email);
        setTwoFAOtp("");
        setTwoFAError("");
        setStep('2fa-verify');
        return;
      }

      // Dual-role: show role picker
      if (result && 'requiresRoleSelection' in result && result.requiresRoleSelection) {
        setPendingRoleData(result as RoleSelectionRequired);
        setStep('role-select');
        return;
      }

      const user = result as any;
      console.log('[Login] Login successful', user?.activeRole || user?.role);

      // Navigate to root — index.tsx reads activeRole and redirects to the right tab
      router.replace('/' as any);
    } catch (error: any) {
      console.error('[Login] Error:', error);
      let errorMsg = error.message || "Invalid email or password.";

      if (errorMsg.includes("verified") || errorMsg.includes("verify") || errorMsg.includes("NOT_VERIFY")) {
        setEmailError("Please verify your email first. Check your inbox for OTP.");
        Toast.show({ type: "error", text1: "Please verify your email first.", text2: "Check your inbox for OTP." });
        setTimeout(() => {
          router.push({
            pathname: "/verify-email",
            params: { email: email },
          } as any);
        }, 2000);
      } else if (errorMsg.includes("not found") || errorMsg.includes("Invalid") || errorMsg.includes("Unauthorized") || errorMsg.includes("password")) {
        setEmailError("Invalid email or password.");
        setPasswordError("Invalid email or password.");
        Toast.show({ type: "error", text1: "Invalid email or password.", text2: "Please try again." });
      } else if (errorMsg.includes("Network") || errorMsg.includes("timeout") || errorMsg.includes("Failed to fetch")) {
        Toast.show({ type: "error", text1: "Connection error.", text2: "Please check your internet connection." });
      } else {
        Toast.show({ type: "error", text1: errorMsg });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = async (role: string) => {
    setIsLoading(true);
    setLoadingRole(role);
    try {
      await loginWithRole(email, password, role as 'Client' | 'Freelancer', preAuthToken || undefined);
      console.log('[Login] Role selected:', role);
      router.replace('/' as any);
    } catch (error: any) {
      Toast.show({ type: "error", text1: "Login failed.", text2: error.message || "Please try again." });
    } finally {
      setIsLoading(false);
      setLoadingRole(null);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFAOtp.trim()) {
      setTwoFAError("Please enter the OTP sent to your email.");
      return;
    }
    setIsLoading(true);
    setTwoFAError("");
    try {
      const result = await authService.preVerify2FA(pending2FAEmail, twoFAOtp.trim());
      // OTP verified — store preAuthToken and move to role selection
      setPreAuthToken(result.preAuthToken);
      setPendingRoleData({
        requiresRoleSelection: true,
        roles: result.roles,
        email: result.email,
        userId: result.userId,
      });
      setStep('role-select');
    } catch (error: any) {
      setTwoFAError(error.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === '2fa-verify') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.logoText}>PAK FREELANCE</Text>
          </View>
          <View style={styles.mainContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Two-Factor Authentication</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit OTP sent to{"\n"}{pending2FAEmail || email}
              </Text>
            </View>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>OTP Code</Text>
                <View style={[styles.inputWrapper, focusedInput === '2fa' && styles.inputWrapperFocused, twoFAError ? styles.inputWrapperError : undefined]}>
                  <Lock size={20} color={focusedInput === '2fa' ? COLORS.primary : COLORS.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor={COLORS.textTertiary}
                    value={twoFAOtp}
                    onChangeText={(t) => { setTwoFAOtp(t); setTwoFAError(""); }}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                    onFocus={() => setFocusedInput('2fa')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
                {twoFAError ? <Text style={styles.errorText}>{twoFAError}</Text> : null}
              </View>
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleVerify2FA}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.loginButtonText}>Verify & Sign In</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep('credentials')} style={{ alignItems: 'center', marginTop: 16 }}>
                <Text style={{ color: COLORS.textTertiary, fontSize: 14 }}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (step === 'role-select' && pendingRoleData) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.logoText}>PAK FREELANCE</Text>
          </View>

          <View style={styles.mainContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Choose your role</Text>
              <Text style={styles.subtitle}>Select how you want to use the platform today</Text>
            </View>

            <View style={styles.roleCardsContainer}>
              {pendingRoleData.roles.includes('Freelancer') && (
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => handleRoleSelect('Freelancer')}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <View style={styles.roleIconBox}>
                    <Briefcase size={32} color={COLORS.primary} strokeWidth={2} />
                  </View>
                  <Text style={styles.roleCardTitle}>Freelancer</Text>
                  <Text style={styles.roleCardSubtitle}>Find work & submit proposals</Text>
                  {loadingRole === 'Freelancer' && (
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: 8 }} />
                  )}
                </TouchableOpacity>
              )}
              {pendingRoleData.roles.includes('Client') && (
                <TouchableOpacity
                  style={styles.roleCard}
                  onPress={() => handleRoleSelect('Client')}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <View style={styles.roleIconBox}>
                    <UserCircle size={32} color={COLORS.primary} strokeWidth={2} />
                  </View>
                  <Text style={styles.roleCardTitle}>Client</Text>
                  <Text style={styles.roleCardSubtitle}>Post projects & hire talent</Text>
                  {loadingRole === 'Client' && (
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: 8 }} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to access your dashboard</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View               style={[
                styles.inputWrapper,
                focusedInput === 'email' && styles.inputWrapperFocused,
                emailError ? styles.inputWrapperError : undefined
              ]}>
                <Mail size={20} color={focusedInput === 'email' ? COLORS.primary : COLORS.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="name@email.com"
                  placeholderTextColor={COLORS.textTertiary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearFieldErrors();
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  editable={!isLoading}
                />
              </View>
              {emailError ? <Text style={styles.fieldErrorText}>{emailError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity onPress={() => router.push("/forgot-password" as any)}>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View               style={[
                styles.inputWrapper,
                focusedInput === 'password' && styles.inputWrapperFocused,
                passwordError ? styles.inputWrapperError : undefined
              ]}>
                <Lock size={20} color={focusedInput === 'password' ? COLORS.primary : COLORS.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={COLORS.textTertiary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearFieldErrors();
                  }}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={COLORS.textTertiary} />
                  ) : (
                    <Eye size={20} color={COLORS.textTertiary} />
                  )}
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.fieldErrorText}>{passwordError}</Text> : null}
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>Sign in</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/signup" as any)}
            >
              <Text style={styles.secondaryButtonText}>Create a new account</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    padding: SPACING.l,
  },
  header: {
    paddingTop: 40,
    marginBottom: 40,
  },
  logoText: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
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
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.background,
    marginBottom: SPACING.s,
  },
  passwordLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  forgotPassword: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
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
  inputWrapperError: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  fieldErrorText: {
    marginTop: 6,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.background,
    height: '100%',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  eyeIcon: {
    padding: SPACING.xs,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: BORDER_RADIUS.l,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.s,
    ...SHADOWS.glow,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.l,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: SPACING.m,
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    height: 52,
    borderRadius: BORDER_RADIUS.l,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: COLORS.background,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textTertiary,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  // Role selection styles
  roleCardsContainer: {
    flexDirection: 'row',
    gap: SPACING.m,
    marginBottom: SPACING.xl,
  },
  roleCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.l,
    alignItems: 'center',
    gap: SPACING.s,
    ...SHADOWS.glow,
  },
  roleIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${COLORS.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  roleCardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
  },
  roleCardSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: SPACING.m,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
});
