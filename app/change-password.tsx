import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const router = useRouter();
  const params = useLocalSearchParams();
  const { changePassword } = useAuth();

  const token = (params.token as string) || "";

  const handleChangePassword = async () => {
    setErrorMessage("");

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Please fill all fields.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!token) {
      setErrorMessage("Invalid reset token. Please request a new password reset link.");
      return;
    }

    setIsLoading(true);

    try {
      await changePassword(token, newPassword, confirmPassword);
      
      Alert.alert(
        "Password Changed! ✅",
        "Your password has been changed successfully. You can now login with your new password.",
        [
          {
            text: "Go to Login",
            onPress: () => {
              router.replace("/login" as any);
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to change password. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: "#FEF2F2" }]}>
              <AlertCircle size={48} color="#EF4444" />
            </View>
            <Text style={styles.title}>Invalid Link</Text>
            <Text style={styles.subtitle}>
              This password reset link is invalid or has expired. Please request a new one.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/forgot-password" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Request New Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/login" as any)}
            style={styles.backToLoginButton}
          >
            <Text style={styles.backToLoginText}>
              <ArrowLeft size={16} color="#0F172A" /> Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={isLoading}
        >
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Lock size={48} color="#0F172A" />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your new password below. Make sure it's strong and secure.
          </Text>
        </View>

        {/* Error Message */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={18} color="#DC2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* New Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            <Lock size={16} color="#6B7280" /> New Password
          </Text>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'newPassword' && styles.inputWrapperFocused,
            errorMessage && styles.inputWrapperError
          ]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter new password (min 6 characters)"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setErrorMessage("");
              }}
              onFocus={() => setFocusedInput('newPassword')}
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
              placeholder="Confirm your new password"
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

        {/* Change Password Button */}
        <TouchableOpacity
          style={[styles.button, (isLoading || !newPassword || !confirmPassword) && styles.buttonDisabled]}
          onPress={handleChangePassword}
          disabled={isLoading || !newPassword || !confirmPassword}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Change Password</Text>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={() => router.replace("/login" as any)}
          disabled={isLoading}
          style={styles.backToLoginButton}
        >
          <Text style={styles.backToLoginText}>
            <ArrowLeft size={16} color="#0F172A" /> Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    justifyContent: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    marginBottom: 24,
    borderRadius: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
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
    borderColor: "#0F172A",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: "#EF4444",
    backgroundColor: "#FFFFFF",
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
  button: {
    backgroundColor: "#0F172A",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  backToLoginButton: {
    alignItems: "center",
    padding: 12,
  },
  backToLoginText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "600",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
