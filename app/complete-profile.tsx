import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Plus, X, Link, DollarSign, Phone } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING, SHADOWS } from '@/constants/theme';

export default function CompleteProfile() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; userId?: string }>();
  const { user, updateProfile, isLoading: authLoading } = useAuth();

  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState<string[]>(
    Array.isArray(user?.languages)
      ? (user.languages as { name?: string }[]).map((l) => (typeof l === 'string' ? l : l?.name || '')).filter(Boolean)
      : []
  );
  const [languageInput, setLanguageInput] = useState('');
  const [portfolioLink, setPortfolioLink] = useState(
    typeof user?.portfolio === 'string'
      ? user.portfolio
      : Array.isArray(user?.portfolio) && (user.portfolio as any)[0]?.link
        ? (user.portfolio as any)[0].link
        : ''
  );
  const [hourlyRate, setHourlyRate] = useState(
    user?.hourlyRate != null ? String(user.hourlyRate) : ''
  );
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user && !params.email) {
      router.replace('/login' as any);
    }
  }, [authLoading, user, params.email, router]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    const trimmed = languageInput.trim();
    if (trimmed && !languages.includes(trimmed)) {
      setLanguages([...languages, trimmed]);
      setLanguageInput('');
    }
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to your photos to add a profile picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
        setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    if (!user) {
      setErrorMessage('Session loading. Please wait a moment and try again.');
      return;
    }
    if (!bio.trim()) {
      setErrorMessage('Please add a short bio.');
      return;
    }
    if (skills.length === 0) {
      setErrorMessage('Please add at least one skill.');
      return;
    }
    const rate = hourlyRate.trim() ? parseFloat(hourlyRate) : undefined;
    if (hourlyRate.trim() && (isNaN(rate!) || rate! < 0)) {
      setErrorMessage('Please enter a valid hourly rate.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        bio: bio.trim(),
        profileImage: profileImage || undefined,
        skills,
        languages: languages.length ? languages : undefined,
        portfolio: portfolioLink.trim() || undefined,
        hourlyRate: rate,
        phone: phone.trim(),
      } as any);

      const email = params.email || user?.email;
      const userId = params.userId || user?.id;
      if (email && userId) {
        router.replace({
          pathname: '/verify-email',
          params: { email, userId },
        } as any);
      } else {
        router.replace('/(tabs)' as any);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarUri =
    profileImage && profileImage.startsWith('data:')
      ? profileImage
      : profileImage
        ? profileImage
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.userName || params.email?.charAt(0) || 'F')}&background=4F46E5&color=fff&size=120`;
  const showImage = !!profileImage;

  if (authLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete your profile</Text>
          <Text style={styles.subtitle}>Add your details so clients can find you</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Profile photo - centered */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrap} activeOpacity={0.8}>
            {showImage ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {(user?.userName || 'F').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Camera size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to add or change photo</Text>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.label}>Bio *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell clients about yourself and your experience..."
            placeholderTextColor={COLORS.textTertiary}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.label}>Skills *</Text>
          <View style={styles.tagRow}>
            <TextInput
              style={styles.tagInput}
              placeholder="e.g. React, Node.js"
              placeholderTextColor={COLORS.textTertiary}
              value={skillInput}
              onChangeText={setSkillInput}
              onSubmitEditing={addSkill}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addBtn} onPress={addSkill}>
              <Plus size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.chipWrap}>
            {skills.map((s, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
                <TouchableOpacity onPress={() => removeSkill(i)} hitSlop={8}>
                  <X size={14} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.label}>Languages</Text>
          <View style={styles.tagRow}>
            <TextInput
              style={styles.tagInput}
              placeholder="e.g. English, Urdu"
              placeholderTextColor={COLORS.textTertiary}
              value={languageInput}
              onChangeText={setLanguageInput}
              onSubmitEditing={addLanguage}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addBtn} onPress={addLanguage}>
              <Plus size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.chipWrap}>
            {languages.map((lang, i) => (
              <View key={i} style={[styles.chip, styles.chipLang]}>
                <Text style={styles.chipTextLang}>{lang}</Text>
                <TouchableOpacity onPress={() => removeLanguage(i)} hitSlop={8}>
                  <X size={14} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Portfolio link */}
        <View style={styles.section}>
          <Text style={styles.label}>Portfolio link (optional)</Text>
          <View style={styles.inputWithIcon}>
            <Link size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.inputFlex}
              placeholder="https://yourportfolio.com"
              placeholderTextColor={COLORS.textTertiary}
              value={portfolioLink}
              onChangeText={setPortfolioLink}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Hourly rate & Phone - same row on small screens stacked */}
        <View style={styles.row}>
          <View style={styles.halfSection}>
            <Text style={styles.label}>Hourly rate ($)</Text>
            <View style={styles.inputWithIcon}>
              <DollarSign size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.inputFlex}
                placeholder="25"
                placeholderTextColor={COLORS.textTertiary}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <View style={styles.halfSection}>
            <Text style={styles.label}>Phone number *</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.inputFlex}
                placeholder="+92 300 1234567"
                placeholderTextColor={COLORS.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitBtnText}>Save & continue</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.m,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textTertiary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: SPACING.l,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.background,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: `${COLORS.error}12`,
    borderWidth: 1,
    borderColor: COLORS.error,
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    marginBottom: SPACING.l,
  },
  errorText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.fontSize.base,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarLetter: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.s,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.background,
    marginBottom: SPACING.s,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: BORDER_RADIUS.l,
    paddingHorizontal: SPACING.m,
    minHeight: 52,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginRight: SPACING.s,
  },
  inputFlex: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.background,
    paddingVertical: SPACING.m,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: BORDER_RADIUS.l,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    paddingTop: SPACING.m,
    minHeight: 100,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.background,
    backgroundColor: COLORS.white,
    textAlignVertical: 'top',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
    marginBottom: SPACING.s,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: BORDER_RADIUS.l,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.background,
    backgroundColor: COLORS.white,
    minHeight: 48,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.l,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: `${COLORS.primary}15`,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderRadius: BORDER_RADIUS.full,
  },
  chipLang: {
    backgroundColor: `${COLORS.info}15`,
  },
  chipText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  chipTextLang: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.info,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.m,
    marginBottom: SPACING.xl,
  },
  halfSection: {
    flex: 1,
    minWidth: 0,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    borderRadius: BORDER_RADIUS.l,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...SHADOWS.medium,
  },
  submitBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
