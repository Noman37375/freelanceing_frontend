import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, User, Mail, Lock, Briefcase, UserCircle } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

const Signup = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<'Freelancer' | 'Client' | 'Admin'>('Freelancer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const router = useRouter();
  const { signup } = useAuth();

  const handleSignup = async () => {
    setErrorMessage("");

    // Validation
    if (!userName || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill all fields.");
      return;
    }

    // Username validation
    if (userName.length < 3) {
      setErrorMessage("Username must be at least 3 characters long.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
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
      // Better error handling
      let errorMsg = error.message || "Signup failed. Please try again.";
      
      if (errorMsg.includes("already exists") || errorMsg.includes("User exists") || errorMsg.includes("USER_EXISTS")) {
        errorMsg = "This email or username is already registered. Please use a different one.";
      } else if (errorMsg.includes("Network") || errorMsg.includes("timeout") || errorMsg.includes("Failed to fetch")) {
        errorMsg = "Connection error. Please check your internet and ensure backend is running on port 3000.";
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
      <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start your journey</Text>
          </View>

          {/* Error Message */}
      {errorMessage ? (
            <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
      ) : null}

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <User size={16} color="#6B7280" /> Username
            </Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'userName' && styles.inputWrapperFocused,
              errorMessage && styles.inputWrapperError
            ]}>
      <TextInput
        style={styles.input}
                placeholder="Choose a username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                value={userName}
                onChangeText={(text) => {
                  setUserName(text);
                  setErrorMessage("");
                }}
                onFocus={() => setFocusedInput('userName')}
                onBlur={() => setFocusedInput(null)}
                editable={!isLoading}
      />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Mail size={16} color="#6B7280" /> Email Address
            </Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'email' && styles.inputWrapperFocused,
              errorMessage && styles.inputWrapperError
            ]}>
      <TextInput
        style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
        keyboardType="email-address"
        autoCapitalize="none"
                autoCorrect={false}
        value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMessage("");
                }}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                editable={!isLoading}
      />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Lock size={16} color="#6B7280" /> Password
            </Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'password' && styles.inputWrapperFocused,
              errorMessage && styles.inputWrapperError
            ]}>
      <TextInput
                style={styles.passwordInput}
                placeholder="Create a password (min 6 characters)"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
        value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage("");
                }}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                editable={!isLoading}
      />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff size={22} color="#6B7280" />
                ) : (
                  <Eye size={22} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Lock size={16} color="#6B7280" /> Confirm Password
            </Text>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'confirmPassword' && styles.inputWrapperFocused,
              errorMessage && styles.inputWrapperError
            ]}>
      <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrorMessage("");
                }}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff size={22} color="#6B7280" />
                ) : (
                  <Eye size={22} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Role Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <UserCircle size={16} color="#6B7280" /> Account Type
            </Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'Freelancer' && styles.roleButtonActive
                ]}
                onPress={() => setRole('Freelancer')}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Briefcase size={20} color={role === 'Freelancer' ? "#3B82F6" : "#6B7280"} />
                <Text style={[
                  styles.roleButtonText,
                  role === 'Freelancer' && styles.roleButtonTextActive
                ]}>
                  Freelancer
                </Text>
        </TouchableOpacity>
        <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'Client' && styles.roleButtonActive
                ]}
                onPress={() => setRole('Client')}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <UserCircle size={20} color={role === 'Client' ? "#3B82F6" : "#6B7280"} />
                <Text style={[
                  styles.roleButtonText,
                  role === 'Client' && styles.roleButtonTextActive
                ]}>
                  Client
                </Text>
        </TouchableOpacity>
            </View>
      </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
      </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push("/login" as any)}
              disabled={isLoading}
            >
              <Text style={styles.loginLink}>Sign In</Text>
      </TouchableOpacity>
          </View>
        </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputWrapperFocused: {
    borderColor: "#3B82F6",
    backgroundColor: "#FFFFFF",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: "#EF4444",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 0,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  roleButtonActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  roleButtonText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  roleButtonTextActive: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#3B82F6",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loginText: {
    color: "#6B7280",
    fontSize: 15,
  },
  loginLink: {
    color: "#3B82F6",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default Signup;
