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
  Dimensions,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, User, Mail, Lock, Briefcase, UserCircle, Check, ArrowRight, CheckCircle2 } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

const { width } = Dimensions.get("window");

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

      // Automatically navigate to OTP verification screen
      router.push({
        pathname: "/verify-email",
        params: {
          email: email,
          userId: response.user.id,
        },
      } as any);
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logoText}>FreelancePro</Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Join FreelancePro</Text>
            <Text style={styles.subtitle}>Create an account to start your journey</Text>
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
                <User size={20} color={focusedInput === 'userName' ? '#1dbf73' : '#62646a'} />
                <TextInput
                  style={styles.input}
                  placeholder="john_doe"
                  placeholderTextColor="#95979d"
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
                <Mail size={20} color={focusedInput === 'email' ? '#1dbf73' : '#62646a'} />
                <TextInput
                  style={styles.input}
                  placeholder="name@email.com"
                  placeholderTextColor="#95979d"
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
                <Lock size={20} color={focusedInput === 'password' ? '#1dbf73' : '#62646a'} />
                <TextInput
                  style={styles.input}
                  placeholder="6+ characters"
                  placeholderTextColor="#95979d"
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
                  {showPassword ? <EyeOff size={20} color="#62646a" /> : <Eye size={20} color="#62646a" />}
                </TouchableOpacity>
              </View>

              {/* Criteria */}
              {password.length > 0 && (
                <View style={styles.criteriaContainer}>
                  <View style={styles.criteriaItem}>
                    <CheckCircle2 size={14} color={passwordCriteria.minLength ? '#1dbf73' : '#e4e5e7'} />
                    <Text style={[styles.criteriaText, passwordCriteria.minLength && styles.criteriaTextActive]}>6+ chars</Text>
                  </View>
                  <View style={styles.criteriaItem}>
                    <CheckCircle2 size={14} color={passwordCriteria.hasUppercase ? '#1dbf73' : '#e4e5e7'} />
                    <Text style={[styles.criteriaText, passwordCriteria.hasUppercase && styles.criteriaTextActive]}>Uppercase</Text>
                  </View>
                  <View style={styles.criteriaItem}>
                    <CheckCircle2 size={14} color={passwordCriteria.hasNumber ? '#1dbf73' : '#e4e5e7'} />
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
                <Lock size={20} color={focusedInput === 'confirmPassword' ? '#1dbf73' : '#62646a'} />
                <TextInput
                  style={styles.input}
                  placeholder="Repeat password"
                  placeholderTextColor="#95979d"
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
                    <Briefcase size={20} color={role === 'Freelancer' ? '#1dbf73' : '#62646a'} />
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
                    <UserCircle size={20} color={role === 'Client' ? '#1dbf73' : '#62646a'} />
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
                <ActivityIndicator color="#fff" />
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
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    paddingTop: 40,
    marginBottom: 32,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    letterSpacing: -0.5,
  },
  mainContent: {
    flex: 1,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#222325',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#62646a',
  },

  errorContainer: {
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#d9534f',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    color: '#d9534f',
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222325',
    marginBottom: 8,
  },
  errorText: { color: '#FECACA', fontSize: 14, fontWeight: '500' },

  inputGroup: { marginBottom: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e5e7',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    backgroundColor: '#fff',
    gap: 12,
  },
  inputWrapperFocused: {
    borderColor: '#1dbf73',
    borderWidth: 1,
    shadowColor: '#1dbf73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222325',
    height: '100%',
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
    }),
  },
  eyeIcon: {
    padding: 4,
  },
  criteriaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    paddingLeft: 4,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  criteriaText: {
    fontSize: 12,
    color: '#95979d',
  },
  criteriaTextActive: {
    color: '#1dbf73',
    fontWeight: '500',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e4e5e7',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
  },
  roleCardActive: {
    borderColor: '#1dbf73',
    backgroundColor: '#f2fbf6',
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e4e5e7',
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 6,
    borderColor: '#1dbf73',
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222325',
    marginBottom: 4,
  },
  roleTitleActive: {
    color: '#1dbf73',
  },
  roleDesc: {
    fontSize: 12,
    color: '#62646a',
  },
  signupButton: {
    backgroundColor: '#1dbf73',
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#1dbf73',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  footerText: {
    color: '#62646a',
    fontSize: 14,
  },
  loginLink: {
    color: '#1dbf73',
    fontSize: 14,
    fontWeight: '600',
  },
});

  signupButtonContainer: { borderRadius: 16, overflow: 'hidden' },
  signupButton: { height: 56, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { color: '#94A3B8', fontSize: 15 },
  loginLink: { color: '#818CF8', fontSize: 15, fontWeight: '700' },
});
