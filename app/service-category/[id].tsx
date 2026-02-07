import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  PenTool,
  Code,
  Smartphone,
  Video,
  Database,
  Layout,
  Search,
  MapPin,
  Zap,
  Box,
  ChevronRight,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = width * 0.9;

const getCategoryIcon = (iconName: string, size: number = 48) => {
  const props = { size, color: '#FFF' };
  switch (iconName) {
    case 'PenTool': return <PenTool {...props} />;
    case 'Code': return <Code {...props} />;
    case 'Smartphone': return <Smartphone {...props} />;
    case 'Video': return <Video {...props} />;
    case 'Database': return <Database {...props} />;
    case 'Layout': return <Layout {...props} />;
    case 'Search': return <Search {...props} />;
    case 'MapPin': return <MapPin {...props} />;
    case 'Zap': return <Zap {...props} />;
    default: return <Box {...props} />;
  }
};

export default function ServiceCategoryDetail() {
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    image?: string;
    icon?: string;
    color?: string;
  }>();
  const router = useRouter();

  const name = params.name ?? 'Service Category';
  const image = params.image ?? '';
  const icon = params.icon ?? 'Box';
  const color = params.color ?? '#444751';

  const hasImage = !!image;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Hero: big image or colored block */}
      <View style={styles.heroWrap}>
        {hasImage ? (
          <Image
            source={{ uri: image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: color }]} />
        )}
        {/* Lighter overlay when image exists so image shows; solid color when no image */}
        <View
          style={[
            styles.heroOverlay,
            hasImage ? { backgroundColor: 'rgba(0,0,0,0.35)' } : { backgroundColor: color + 'E6' },
          ]}
        />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroContent}>
          <View style={styles.iconCircle}>
            {getCategoryIcon(icon, 52)}
          </View>
          <Text style={styles.heroTitle}>{name}</Text>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>Category</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentCard}>
          <Text style={styles.sectionLabel}>About</Text>
          <Text style={styles.description}>
            Browse freelancers and services in this category. Find the right talent for your project.
          </Text>
        </View>

        <TouchableOpacity style={[styles.ctaCard, { borderLeftColor: color }]} activeOpacity={0.85}>
          <View style={styles.ctaTextWrap}>
            <Text style={styles.ctaTitle}>Browse services</Text>
            <Text style={styles.ctaSub}>Find freelancers in {name}</Text>
          </View>
          <View style={[styles.ctaIconWrap, { backgroundColor: color + '20' }]}>
            <ChevronRight size={22} color={color} />
          </View>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  heroWrap: {
    width,
    height: HERO_HEIGHT,
    backgroundColor: '#1E1B4B',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  categoryPill: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  categoryPillText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  contentCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  ctaTextWrap: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#444751',
  },
  ctaSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  ctaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 24,
  },
});
