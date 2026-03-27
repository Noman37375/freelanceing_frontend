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
import Toast from 'react-native-toast-message';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import {
  fetchCurrencies,
  filterCurrencies,
  type CurrencyItem,
} from '@/services/currencyService';
import {
  fetchCountryCodes,
  filterCountryCodes,
  type CountryCodeItem,
} from '@/services/countryCodeService';
import {
  fetchLanguages,
  filterLanguages,
  type LanguageItem,
} from '@/services/languageService';

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
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [allLanguages] = useState<LanguageItem[]>(() => fetchLanguages());
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
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);

  const [countryCodes, setCountryCodes] = useState<CountryCodeItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeItem | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [countriesLoading, setCountriesLoading] = useState(true);

  const [linkedinUrl, setLinkedinUrl] = useState((user as any)?.linkedinUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bioError, setBioError] = useState('');
  const [skillsError, setSkillsError] = useState('');
  const [hourlyRateError, setHourlyRateError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [countryError, setCountryError] = useState('');

  useEffect(() => {
    if (!authLoading && !user && !params.email) {
      router.replace('/login' as any);
    }
  }, [authLoading, user, params.email, router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCurrencies();
        if (!cancelled) setCurrencies(list);
      } catch {
        if (!cancelled) setCurrencies([]);
      } finally {
        if (!cancelled) setCurrenciesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCountryCodes();
        if (!cancelled) setCountryCodes(list);
      } catch {
        if (!cancelled) setCountryCodes([]);
      } finally {
        if (!cancelled) setCountriesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (countryCodes.length === 0 || !user?.phone?.trim()) {
      if (countryCodes.length > 0 && !selectedCountry) {
        const pk = countryCodes.find((c) => c.code === 'PK' && c.dialCode === '+92') ?? countryCodes[0];
        setSelectedCountry(pk);
      }
      return;
    }
    const raw = user.phone.trim();
    const digitsOnly = raw.replace(/\D/g, '');
    let best: { country: CountryCodeItem; rest: string } | null = null;
    for (const c of countryCodes) {
      const codeDigits = c.dialCode.replace(/\D/g, '');
      if (!codeDigits || !digitsOnly.startsWith(codeDigits)) continue;
      const rest = digitsOnly.slice(codeDigits.length).replace(/(\d{3})(?=\d)/g, '$1 ').trim();
      if (!best || codeDigits.length > best.country.dialCode.replace(/\D/g, '').length) {
        best = { country: c, rest };
      }
    }
    if (best) {
      setSelectedCountry(best.country);
      setPhoneNumber(best.rest);
    } else {
      setPhoneNumber(raw);
    }
  }, [countryCodes, user?.phone]);

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

  const addLanguage = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !languages.includes(trimmed)) {
      setLanguages([...languages, trimmed]);
    }
    setLanguageInput('');
    setShowLanguageDropdown(false);
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

  const clearFieldErrors = () => {
    setBioError('');
    setSkillsError('');
    setHourlyRateError('');
    setPhoneError('');
    setCountryError('');
  };

  const handleSubmit = async () => {
    setBioError('');
    setSkillsError('');
    setHourlyRateError('');
    setPhoneError('');
    setCountryError('');

    if (!user) {
      Toast.show({ type: 'error', text1: 'Session loading.', text2: 'Please wait a moment and try again.' });
      return;
    }

    let hasError = false;
    if (!bio.trim()) {
      setBioError('Please add a short bio.');
      hasError = true;
    }
    if (skills.length === 0) {
      setSkillsError('Please add at least one skill.');
      hasError = true;
    }
    const rate = hourlyRate.trim() ? parseFloat(hourlyRate) : undefined;
    if (hourlyRate.trim() && (isNaN(rate!) || rate! < 0)) {
      setHourlyRateError('Please enter a valid hourly rate (e.g. 25).');
      hasError = true;
    }
    if (!selectedCountry) {
      setCountryError('Please select your country code.');
      hasError = true;
    }
    const fullPhone = (selectedCountry?.dialCode ?? '').replace(/\D/g, '') + phoneNumber.replace(/\D/g, '');
    if (selectedCountry && !fullPhone.trim()) {
      setPhoneError('Please enter your phone number.');
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);
    try {
      await updateProfile({
        bio: bio.trim(),
        profileImage: profileImage || undefined,
        skills,
        languages: languages.length ? languages : undefined,
        portfolio: portfolioLink.trim() || undefined,
        hourlyRate: rate,
        currency: currency || 'USD',
        phone: (selectedCountry?.dialCode ?? '') + ' ' + phoneNumber.trim().replace(/\D/g, ''),
        ...(linkedinUrl ? { linkedinUrl } : {}),
      } as any);

      router.replace('/(tabs)' as any);
    } catch (err: any) {
      const msg = err.message || 'Failed to save profile.';
      Toast.show({ type: 'error', text1: 'Profile error.', text2: msg });
      if (msg.toLowerCase().includes('bio')) setBioError(msg);
      else if (msg.toLowerCase().includes('skill')) setSkillsError(msg);
      else if (msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('hourly')) setHourlyRateError(msg);
      else if (msg.toLowerCase().includes('phone')) setPhoneError(msg);
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
            style={[styles.textArea, bioError ? styles.inputError : undefined]}
            placeholder="Tell clients about yourself and your experience..."
            placeholderTextColor={COLORS.textTertiary}
            value={bio}
            onChangeText={(t) => { setBio(t); clearFieldErrors(); }}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {bioError ? <Text style={styles.fieldErrorText}>{bioError}</Text> : null}
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.label}>Skills *</Text>
          <View style={styles.tagRow}>
            <TextInput
              style={[styles.tagInput, skillsError ? styles.inputError : undefined]}
              placeholder="e.g. React, Node.js"
              placeholderTextColor={COLORS.textTertiary}
              value={skillInput}
              onChangeText={(t) => { setSkillInput(t); clearFieldErrors(); }}
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
          {skillsError ? <Text style={styles.fieldErrorText}>{skillsError}</Text> : null}
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.label}>Languages</Text>
          <TextInput
            style={styles.tagInput}
            placeholder="Search language (e.g. English, Urdu)"
            placeholderTextColor={COLORS.textTertiary}
            value={languageInput}
            onChangeText={(t) => { setLanguageInput(t); setShowLanguageDropdown(true); }}
            onFocus={() => setShowLanguageDropdown(true)}
            returnKeyType="done"
          />
          {showLanguageDropdown && (
            <View style={styles.currencyDropdown}>
              <ScrollView style={styles.currencyList} keyboardShouldPersistTaps="handled">
                {filterLanguages(allLanguages, languageInput).length === 0 ? (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownEmpty}>No languages found</Text>
                  </View>
                ) : (
                  filterLanguages(allLanguages, languageInput).map((l) => (
                    <TouchableOpacity
                      key={l.code}
                      style={[
                        styles.dropdownItem,
                        languages.includes(l.name) && styles.dropdownItemActive,
                      ]}
                      onPress={() => addLanguage(l.name)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dropdownItemText}>{l.displayLabel}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
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
            <Text style={styles.label}>Hourly rate</Text>
            <TouchableOpacity
              style={styles.currencyTrigger}
              onPress={() => { setShowCurrencyDropdown((v) => !v); setShowCountryDropdown(false); }}
              activeOpacity={0.8}
            >
              {currenciesLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.currencyTriggerText} numberOfLines={1}>
                  {currencies.find((c) => c.code === currency)?.displayLabel ?? `${currency} – ${currency}`}
                </Text>
              )}
            </TouchableOpacity>
            {showCurrencyDropdown && (
              <View style={styles.currencyDropdown}>
                <TextInput
                  style={styles.currencySearchInput}
                  placeholder="Search currency (e.g. USD, PKR)"
                  placeholderTextColor={COLORS.textTertiary}
                  value={currencySearch}
                  onChangeText={setCurrencySearch}
                  autoFocus
                />
                <ScrollView style={styles.currencyList} keyboardShouldPersistTaps="handled">
                  {filterCurrencies(currencies, currencySearch).length === 0 ? (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownEmpty}>{currenciesLoading ? 'Loading…' : 'No currencies found'}</Text>
                    </View>
                  ) : (
                    filterCurrencies(currencies, currencySearch).map((c) => (
                      <TouchableOpacity
                        key={c.code}
                        style={[styles.dropdownItem, currency === c.code && styles.dropdownItemActive]}
                        onPress={() => { setCurrency(c.code); setCurrencySearch(''); setShowCurrencyDropdown(false); }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownItemText} numberOfLines={1}>{c.displayLabel}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
            <View style={[styles.inputWithIcon, hourlyRateError ? styles.inputError : undefined]}>
              <DollarSign size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.inputFlex}
                placeholder="25"
                placeholderTextColor={COLORS.textTertiary}
                value={hourlyRate}
                onChangeText={(t) => { setHourlyRate(t); clearFieldErrors(); }}
                keyboardType="decimal-pad"
              />
            </View>
            {hourlyRateError ? <Text style={styles.fieldErrorText}>{hourlyRateError}</Text> : null}
          </View>
          <View style={styles.halfSection}>
            <Text style={styles.label}>Phone number *</Text>
            <TouchableOpacity
              style={[styles.currencyTrigger, countryError ? styles.inputError : undefined]}
              onPress={() => { setShowCountryDropdown((v) => !v); setShowCurrencyDropdown(false); clearFieldErrors(); }}
              activeOpacity={0.8}
            >
              {countriesLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.currencyTriggerText} numberOfLines={1}>
                  {selectedCountry ? selectedCountry.displayLabel : 'Select country'}
                </Text>
              )}
            </TouchableOpacity>
            {showCountryDropdown && (
              <View style={styles.currencyDropdown}>
                <TextInput
                  style={styles.currencySearchInput}
                  placeholder="Search country or code"
                  placeholderTextColor={COLORS.textTertiary}
                  value={countrySearch}
                  onChangeText={setCountrySearch}
                  autoFocus
                />
                <ScrollView style={styles.currencyList} keyboardShouldPersistTaps="handled">
                  {filterCountryCodes(countryCodes, countrySearch).length === 0 ? (
                    <View style={styles.dropdownItem}>
                      <Text style={styles.dropdownEmpty}>{countriesLoading ? 'Loading…' : 'No countries found'}</Text>
                    </View>
                  ) : (
                    filterCountryCodes(countryCodes, countrySearch).map((c) => (
                      <TouchableOpacity
                        key={`${c.code}-${c.dialCode}`}
                        style={[styles.dropdownItem, selectedCountry?.code === c.code && selectedCountry?.dialCode === c.dialCode && styles.dropdownItemActive]}
                        onPress={() => { setSelectedCountry(c); setCountrySearch(''); setShowCountryDropdown(false); }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownItemText} numberOfLines={1}>{c.displayLabel}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
            <View style={[styles.inputWithIcon, phoneError ? styles.inputError : undefined]}>
              <Phone size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.inputFlex}
                placeholder="300 1234567"
                placeholderTextColor={COLORS.textTertiary}
                value={phoneNumber}
                onChangeText={(t) => { setPhoneNumber(t); clearFieldErrors(); }}
                keyboardType="phone-pad"
              />
            </View>
            {countryError ? <Text style={styles.fieldErrorText}>{countryError}</Text> : null}
            {phoneError ? <Text style={styles.fieldErrorText}>{phoneError}</Text> : null}
          </View>
        </View>

        {/* LinkedIn URL */}
        <View style={styles.section}>
          <Text style={styles.label}>LinkedIn URL (optional)</Text>
          <View style={styles.inputWithIcon}>
            <Link size={20} color={COLORS.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.inputFlex}
              placeholder="https://linkedin.com/in/yourprofile"
              placeholderTextColor={COLORS.textTertiary}
              value={linkedinUrl}
              onChangeText={setLinkedinUrl}
              keyboardType="url"
              autoCapitalize="none"
            />
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
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  fieldErrorText: {
    marginTop: 6,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    fontWeight: '600',
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
    paddingTop: 10,
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
  currencyTrigger: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.l,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: SPACING.s,
    backgroundColor: COLORS.white,
  },
  currencyTriggerText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  currencyDropdown: {
    marginBottom: SPACING.s,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.l,
    maxHeight: 220,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  currencySearchInput: {
    padding: SPACING.m,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  currencyList: {
    maxHeight: 180,
  },
  dropdownItem: {
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.m,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.surfaceMuted,
  },
  dropdownItemText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textPrimary,
  },
  dropdownEmpty: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textTertiary,
    padding: SPACING.m,
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
