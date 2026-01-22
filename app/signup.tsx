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
import { Eye, EyeOff, User, Mail, Lock, Briefcase, UserCircle, ArrowLeft, Check, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/contexts/AuthContext";

const { width, height } = Dimensions.get("window");

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
      if (errorMsg.includes("already exists") || errorMsg.includes("User exists")) {
        errorMsg = "This email or username is already registered.";
      } else if (errorMsg.includes("Network")) {
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
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subtitle}>Join thousands of professionals today.</Text>
            </View>

            <View style={styles.signupCard}>
              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, focusedInput === 'userName' && styles.inputWrapperFocused]}>
                  <User size={20} color={focusedInput === 'userName' ? "#818CF8" : "#94A3B8"} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Username"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    value={userName}
                    onChangeText={(text) => { setUserName(text); setErrorMessage(""); }}
                    onFocus={() => setFocusedInput('userName')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                  {userName.length > 0 && (
                    <TouchableOpacity onPress={() => setUserName("")}>
                      <X size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

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

              <View style={styles.inputGroup}>
                <View style={[styles.inputWrapper, focusedInput === 'confirmPassword' && styles.inputWrapperFocused]}>
                  <Lock size={20} color={focusedInput === 'confirmPassword' ? "#818CF8" : "#94A3B8"} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm Password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(text) => { setConfirmPassword(text); setErrorMessage(""); }}
                    onFocus={() => setFocusedInput('confirmPassword')}
                    onBlur={() => setFocusedInput(null)}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={20} color="#94A3B8" /> : <Eye size={20} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[styles.roleButton, role === 'Freelancer' && styles.roleButtonActive]}
                  onPress={() => setRole('Freelancer')}
                >
                  <Briefcase size={20} color={role === 'Freelancer' ? "#FFFFFF" : "#94A3B8"} />
                  <Text style={[styles.roleButtonText, role === 'Freelancer' && styles.roleButtonTextActive]}>Freelancer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleButton, role === 'Client' && styles.roleButtonActive]}
                  onPress={() => setRole('Client')}
                >
                  <UserCircle size={20} color={role === 'Client' ? "#FFFFFF" : "#94A3B8"} />
                  <Text style={[styles.roleButtonText, role === 'Client' && styles.roleButtonTextActive]}>Client</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleSignup} disabled={isLoading} style={styles.signupButtonContainer}>
                <LinearGradient
                  colors={['#4F46E5', '#4338CA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signupButton}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login" as any)}>
                <Text style={styles.loginLink}>Sign In</Text>
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
  scrollContent: { flexGrow: 1 },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },

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
  brandText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  welcomeText: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', maxWidth: '80%' },

  signupCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24
  },

  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12, padding: 12, marginBottom: 20, alignItems: 'center'
  },
  errorText: { color: '#FECACA', fontSize: 14, fontWeight: '500' },

  inputGroup: { marginBottom: 12 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 16, height: 52, paddingHorizontal: 16
  },
  inputWrapperFocused: { borderColor: '#818CF8', borderWidth: 1.5 },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, color: '#FFFFFF', fontSize: 16 },

  roleContainer: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 24 },
  roleButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 48, borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  roleButtonActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.2)', borderColor: '#4F46E5'
  },
  roleButtonText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  roleButtonTextActive: { color: '#FFFFFF' },

  signupButtonContainer: { borderRadius: 16, overflow: 'hidden' },
  signupButton: { height: 56, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { color: '#94A3B8', fontSize: 15 },
  loginLink: { color: '#818CF8', fontSize: 15, fontWeight: '700' },
});
