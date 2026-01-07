import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Eye, EyeOff, User, Mail, Lock, Briefcase, UserCircle, ArrowLeft, X, Check } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/contexts/AuthContext";

const { width, height } = Dimensions.get("window");

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
    <ImageBackground
      source={{ uri: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2074&q=80" }}
      style={styles.container}
      blurRadius={10}
    >
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.8)']}
        style={styles.backgroundGradient}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={20} color="#fff" />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.brandContainer}>
                <View style={styles.logoContainer}>
                  <Briefcase size={28} color="#A855F7" />
                </View>
                <Text style={styles.brandText}>
                  Join <Text style={styles.brandHighlight}>FreelancePro</Text>
                </Text>
              </View>
              <Text style={styles.welcomeText}>
                Start Your Journey
              </Text>
              <Text style={styles.subtitle}>
                Create an account and unlock opportunities in the freelance world
              </Text>
            </View>

            {/* Signup Card */}
            <View style={styles.signupCard}>
              {/* Error Message */}
              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Username Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <User size={18} color="#A855F7" />
                  <Text style={styles.inputLabel}>Username</Text>
                </View>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'userName' && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="john_doe"
                    placeholderTextColor="#94A3B8"
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
                  {userName && (
                    <TouchableOpacity 
                      onPress={() => setUserName("")} 
                      style={styles.clearButton}
                    >
                      <View style={styles.clearButtonInner}>
                        <X size={12} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Mail size={18} color="#A855F7" />
                  <Text style={styles.inputLabel}>Email Address</Text>
                </View>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'email' && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="you@example.com"
                    placeholderTextColor="#94A3B8"
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
                  {email && (
                    <TouchableOpacity 
                      onPress={() => setEmail("")} 
                      style={styles.clearButton}
                    >
                      <View style={styles.clearButtonInner}>
                        <X size={12} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Lock size={18} color="#A855F7" />
                  <Text style={styles.inputLabel}>Password</Text>
                </View>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'password' && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={handlePasswordChange}
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
                      <EyeOff size={22} color="#A855F7" />
                    ) : (
                      <Eye size={22} color="#A855F7" />
                    )}
                  </TouchableOpacity>
                </View>
                
                {/* Password Criteria */}
                {password.length > 0 && (
                  <View style={styles.criteriaContainer}>
                    <View style={styles.criteriaItem}>
                      <View style={[
                        styles.criteriaIcon,
                        passwordCriteria.minLength && styles.criteriaIconActive
                      ]}>
                        {passwordCriteria.minLength ? (
                          <Check size={10} color="#FFFFFF" />
                        ) : null}
                      </View>
                      <Text style={[
                        styles.criteriaText,
                        passwordCriteria.minLength && styles.criteriaTextActive
                      ]}>
                        At least 6 characters
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      <View style={[
                        styles.criteriaIcon,
                        passwordCriteria.hasUppercase && styles.criteriaIconActive
                      ]}>
                        {passwordCriteria.hasUppercase ? (
                          <Check size={10} color="#FFFFFF" />
                        ) : null}
                      </View>
                      <Text style={[
                        styles.criteriaText,
                        passwordCriteria.hasUppercase && styles.criteriaTextActive
                      ]}>
                        One uppercase letter
                      </Text>
                    </View>
                    <View style={styles.criteriaItem}>
                      <View style={[
                        styles.criteriaIcon,
                        passwordCriteria.hasNumber && styles.criteriaIconActive
                      ]}>
                        {passwordCriteria.hasNumber ? (
                          <Check size={10} color="#FFFFFF" />
                        ) : null}
                      </View>
                      <Text style={[
                        styles.criteriaText,
                        passwordCriteria.hasNumber && styles.criteriaTextActive
                      ]}>
                        One number
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Lock size={18} color="#A855F7" />
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                </View>
                <View style={[
                  styles.inputWrapper,
                  focusedInput === 'confirmPassword' && styles.inputWrapperFocused
                ]}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
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
                      <EyeOff size={22} color="#A855F7" />
                    ) : (
                      <Eye size={22} color="#A855F7" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Role Selection */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <UserCircle size={18} color="#A855F7" />
                  <Text style={styles.inputLabel}>Account Type</Text>
                </View>
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
                    <Briefcase size={20} color={role === 'Freelancer' ? "#FFFFFF" : "#94A3B8"} />
                    <Text style={[
                      styles.roleButtonText,
                      role === 'Freelancer' && styles.roleButtonTextActive
                    ]}>
                      Freelancer
                    </Text>
                    {role === 'Freelancer' && (
                      <View style={styles.selectedIndicator}>
                        <Check size={12} color="#FFFFFF" />
                      </View>
                    )}
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
                    <UserCircle size={20} color={role === 'Client' ? "#FFFFFF" : "#94A3B8"} />
                    <Text style={[
                      styles.roleButtonText,
                      role === 'Client' && styles.roleButtonTextActive
                    ]}>
                      Client
                    </Text>
                    {role === 'Client' && (
                      <View style={styles.selectedIndicator}>
                        <Check size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.roleDescription}>
                  {role === 'Freelancer' 
                    ? "Offer your skills and services to clients worldwide"
                    : "Find talented freelancers for your projects"
                  }
                </Text>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignup}
                disabled={isLoading}
                style={styles.signupButtonContainer}
              >
                <LinearGradient
                  colors={['#A855F7', '#7C3AED']}
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

              {/* Terms & Privacy */}
              <Text style={styles.termsText}>
                By creating an account, you agree to our 
                <Text style={styles.termsLink}> Terms of Service </Text>
                and 
                <Text style={styles.termsLink}> Privacy Policy</Text>
              </Text>
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

            {/* Bottom Info */}
            <View style={styles.bottomInfoContainer}>
              <Text style={styles.bottomInfoText}>
                Trusted by 50,000+ professionals worldwide
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
          style={styles.bottomGradient}
          pointerEvents="none"
        />
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  header: {
    marginBottom: 30,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: '#A855F7',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 22,
  },
  signupCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    color: '#FECACA',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: '#A855F7',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInput: {
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 0,
    flex: 1,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  criteriaContainer: {
    marginTop: 12,
    gap: 8,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criteriaIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  criteriaIconActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  criteriaText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  criteriaTextActive: {
    color: '#10B981',
    fontWeight: '500',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  roleButtonActive: {
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleDescription: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  signupButtonContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  signupButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#D8B4FE',
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  loginLink: {
    color: '#D8B4FE',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 4,
  },
  bottomInfoContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomInfoText: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    pointerEvents: 'none',
  },
});

export default Signup;