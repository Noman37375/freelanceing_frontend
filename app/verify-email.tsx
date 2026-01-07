import React, { useState, useEffect } from "react";
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
import { Mail, ArrowLeft, CheckCircle, Clock, AlertCircle } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const router = useRouter();
  const params = useLocalSearchParams();
  const { verifyEmail, resendOTP, user } = useAuth();

  const email = (params.email as string) || user?.email || "";
  const userId = (params.userId as string) || user?.id || "";

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!otp || otp.length !== 6) {
      setErrorMessage("Please enter a valid 6-character OTP.");
      return;
    }

    setIsLoading(true);

    try {
      console.log('[VerifyEmail] Verifying OTP:', otp);
      await verifyEmail(otp);
      console.log('[VerifyEmail] Verification successful!');
      
      // Show success message
      setSuccessMessage("Email verified successfully! Redirecting to login...");
      
      // Automatically redirect to login after 1.5 seconds
      setTimeout(() => {
        router.replace("/login" as any);
      }, 1500);
      
    } catch (error: any) {
      console.error('[VerifyEmail] Verification error:', error);
      setErrorMessage(error.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || !email || !userId) {
      return;
    }

    setResendLoading(true);
    setErrorMessage("");

    try {
      await resendOTP(email, userId);
      setCountdown(60); // 60 seconds countdown
      Alert.alert("Success", "OTP has been resent to your email.");
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

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
            <Mail size={48} color="#3B82F6" />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit verification code to
          </Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        {/* Success Message */}
        {successMessage ? (
          <View style={styles.successContainer}>
            <CheckCircle size={18} color="#10B981" />
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}

        {/* Error Message */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={18} color="#DC2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <Text style={styles.otpLabel}>Enter Verification Code</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="abc123"
            placeholderTextColor="#D1D5DB"
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={6}
            value={otp}
            onChangeText={(text) => {
              // Allow alphanumeric characters only (letters + numbers)
              const cleanedText = text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
              setOtp(cleanedText);
              setErrorMessage("");
            }}
            editable={!isLoading}
            autoFocus
            selectTextOnFocus
          />
          <Text style={styles.otpHint}>Enter the 6-character code from your email (letters + numbers)</Text>
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.button, (isLoading || otp.length !== 6) && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={isLoading || otp.length !== 6}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Verify Email</Text>
          )}
        </TouchableOpacity>

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {countdown > 0 ? (
            <View style={styles.countdownContainer}>
              <Clock size={14} color="#6B7280" />
              <Text style={styles.countdownText}>
                Resend in {countdown}s
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={resendLoading || !email || !userId}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text style={styles.resendLink}>Resend OTP</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
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
    marginBottom: 8,
    lineHeight: 24,
  },
  emailText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
    textAlign: "center",
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
  otpContainer: {
    marginBottom: 32,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  otpInput: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 12,
    color: "#111827",
  },
  otpHint: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
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
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  resendText: {
    color: "#6B7280",
    fontSize: 14,
  },
  resendLink: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  countdownText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 10,
  },
  successText: {
    flex: 1,
    color: "#10B981",
    fontSize: 14,
    fontWeight: "500",
  },
});
