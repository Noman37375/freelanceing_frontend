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
  ImageBackground,
  Dimensions,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle, Briefcase, ArrowRight, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/contexts/AuthContext";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please fill all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      console.log('[Login] Attempting login for:', email);
      await login(email, password);
      console.log('[Login] Login successful');
      router.replace("/(tabs)" as any);
    } catch (error: any) {
      console.error('[Login] Error:', error);
      let errorMsg = error.message || "Invalid email or password.";

      if (errorMsg.includes("not found") || errorMsg.includes("Invalid") || errorMsg.includes("Unauthorized")) {
        errorMsg = "Invalid email or password. Please try again.";
      } else if (errorMsg.includes("verified") || errorMsg.includes("verify") || errorMsg.includes("NOT_VERIFY")) {
        errorMsg = "Please verify your email first.";
        setTimeout(() => {
          router.push({
            pathname: "/verify-email",
            params: { email: email },
          } as any);
        }, 2000);
      } else if (errorMsg.includes("Network") || errorMsg.includes("timeout") || errorMsg.includes("Failed to fetch")) {
        errorMsg = "Connection error. Please check your internet.";
      }

      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80" }}
      style={styles.container}
      blurRadius={8}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['rgba(15, 23, 42, 0.85)', 'rgba(30, 27, 75, 0.9)']}
        style={styles.backgroundGradient}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.brandContainer}>
                <View style={styles.logoContainer}>
                  <Briefcase size={32} color="#4F46E5" />
                </View>
                <Text style={styles.brandText}>FreelancePro</Text>
              </View>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue to your dashboard.</Text>
            </View>

            <View style={styles.loginCard}>
              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={20} color="#F87171" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, focusedInput === 'email' && styles.inputWrapperFocused]}>
                  <Mail size={20} color={focusedInput === 'email' ? "#818CF8" : "#94A3B8"} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Email Address"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => { setEmail(text); setErrorMessage(""); }}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                  {email.length > 0 && (
                    <TouchableOpacity onPress={() => setEmail("")}>
                      <X size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, focusedInput === 'password' && styles.inputWrapperFocused]}>
                  <Lock size={20} color={focusedInput === 'password' ? "#818CF8" : "#94A3B8"} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => { setPassword(text); setErrorMessage(""); }}
                    onFocus={() => setFocusedInput('password')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={() => router.push("/forgot-password" as any)} style={styles.forgotPasswordLink}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogin} disabled={isLoading} style={styles.loginButtonContainer}>
                <LinearGradient
                  colors={['#4F46E5', '#4338CA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupPromptText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/signup" as any)}>
                <Text style={styles.signupButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  backgroundGradient: { ...StyleSheet.absoluteFillObject },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  content: { padding: 24, paddingTop: 60 },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },

  header: { marginBottom: 32, alignItems: 'center' },
  brandContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  logoContainer: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 16
  },
  brandText: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  welcomeText: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', maxWidth: '80%' },

  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24, padding: 32,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24
  },

  errorContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12, padding: 12, marginBottom: 20
  },
  errorText: { color: '#FECACA', fontSize: 14, marginLeft: 8, flex: 1 },

  inputGroup: { marginBottom: 16 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 16, height: 56, paddingHorizontal: 16
  },
  inputWrapperFocused: { borderColor: '#818CF8', borderWidth: 1.5 },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, color: '#FFFFFF', fontSize: 16 },

  forgotPasswordLink: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: '#818CF8', fontSize: 14, fontWeight: '600' },

  loginButtonContainer: { borderRadius: 16, overflow: 'hidden' },
  loginButton: { height: 56, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  signupContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  signupPromptText: { color: '#94A3B8', fontSize: 14 },
  signupButtonText: { color: '#818CF8', fontSize: 14, fontWeight: '700' },
});