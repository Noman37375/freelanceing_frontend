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
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.85;

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

  const id = params.id;
  const name = params.name ?? 'Service Category';
  const image = params.image ?? '';
  const icon = params.icon ?? 'Box';
  const color = params.color ?? '#6366F1';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.imageWrapper}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroImagePlaceholder, { backgroundColor: color }]} />
        )}
        <View style={[styles.imageOverlay, { backgroundColor: color + 'CC' }]}>
          <View style={styles.iconCircle}>
            {getCategoryIcon(icon, 56)}
          </View>
          <Text style={styles.categoryName}>{name}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.accentBar, { backgroundColor: color }]} />
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.subtitle}>
          Browse freelancers and services in this category. Find the right talent for your project.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width,
    height: IMAGE_HEIGHT,
    backgroundColor: '#1E1B4B',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryName: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 28,
  },
  accentBar: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
});
