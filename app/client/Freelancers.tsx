import React, { useState, useMemo } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Platform, StatusBar, Modal 
} from 'react-native';
import { 
  Search, Filter, User, Star, MapPin, Heart, X, 
  Globe, ArrowLeft, UserCheck, DollarSign 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // Added router

// --- CONFIG & DATA ---
const CURRENCIES = {
  USD: { symbol: '$', rate: 1, label: 'USD', locale: 'en-US', maxSlider: 200 },
  PKR: { symbol: 'Rs.', rate: 280.50, label: 'PKR', locale: 'en-PK', maxSlider: 60000 },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR', locale: 'de-DE', maxSlider: 180 },
};

const FREELANCERS_DATA = [
  { id: '1', name: 'Sarah Johnson', title: 'UI/UX Designer', rating: 4.9, reviews: 127, hourlyRate: 85, location: 'San Francisco', skills: ['Figma', 'Prototyping'], availability: 'Available' },
  { id: '2', name: 'Michael Chen', title: 'Full Stack Dev', rating: 4.2, reviews: 94, hourlyRate: 95, location: 'New York', skills: ['React', 'Node.js'], availability: 'Available' },
  { id: '3', name: 'Emma Davis', title: 'Graphic Designer', rating: 5.0, reviews: 156, hourlyRate: 45, location: 'London', skills: ['Branding', 'Adobe CC'], availability: 'Busy' },
  { id: '4', name: 'Zain Ahmed', title: 'Mobile Specialist', rating: 4.7, reviews: 88, hourlyRate: 65, location: 'Karachi, PK', skills: ['React Native', 'Firebase'], availability: 'Available' },
];

export default function MidnightPrismApp() {
  const router = useRouter(); // Initialize router
  
  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCurrency, setActiveCurrency] = useState(CURRENCIES.USD);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(CURRENCIES.USD.maxSlider); 

  // --- ACTIONS ---
  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const cycleCurrency = () => {
    const sequence = [CURRENCIES.USD, CURRENCIES.PKR, CURRENCIES.EUR];
    const nextIndex = (sequence.findIndex(c => c.label === activeCurrency.label) + 1) % sequence.length;
    const nextCurrency = sequence[nextIndex];
    setActiveCurrency(nextCurrency);
    setMaxPrice(nextCurrency.maxSlider); 
  };

  const formatPrice = (usdBase: number) => {
    const converted = usdBase * activeCurrency.rate;
    return `${activeCurrency.symbol}${converted.toLocaleString(activeCurrency.locale, { maximumFractionDigits: 0 })}`;
  };

  const filteredData = useMemo(() => {
    return FREELANCERS_DATA.filter(item => {
      const currentPrice = item.hourlyRate * activeCurrency.rate;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRating = item.rating >= minRating;
      const matchesPrice = currentPrice <= maxPrice;
      const matchesFav = showFavsOnly ? favorites.includes(item.id) : true;
      return matchesSearch && matchesRating && matchesPrice && matchesFav;
    });
  }, [searchQuery, minRating, maxPrice, favorites, showFavsOnly, activeCurrency]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            {/* GOING BACK ARROW */}
            <TouchableOpacity style={styles.backArrow} onPress={() => router.back()}>
               <ArrowLeft size={24} color="#1E293B" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{showFavsOnly ? 'Favorites' : 'Talent Hub'}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.currencyBadge} onPress={cycleCurrency}>
              <Globe size={14} color="#6366F1" />
              <Text style={styles.currencyText}>{activeCurrency.label}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconBtn, showFavsOnly && styles.favBtnActive]} 
              onPress={() => setShowFavsOnly(!showFavsOnly)}
            >
              {favorites.length > 0 && (
                <View style={styles.badge}><Text style={styles.badgeText}>{favorites.length}</Text></View>
              )}
              <Heart size={20} color={showFavsOnly ? "#FFF" : "#1E293B"} fill={showFavsOnly ? "#FFF" : "none"} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.searchBar}>
            <Search size={18} color="#94A3B8" />
            <TextInput 
              placeholder="Search developers..." 
              style={styles.searchInput} 
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            style={[styles.filterBtn, (minRating > 0 || maxPrice < activeCurrency.maxSlider) && styles.filterBtnActive]} 
            onPress={() => setIsFilterVisible(true)}
          >
            <Filter size={20} color={(minRating > 0 || maxPrice < activeCurrency.maxSlider) ? "#FFF" : "#6366F1"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST */}
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.resultsCount}>FOUND {filteredData.length} TALENTS</Text>
        
        {filteredData.length === 0 ? (
          <View style={styles.empty}><UserCheck size={40} color="#CBD5E1" /><Text style={styles.emptyText}>No matches found</Text></View>
        ) : (
          filteredData.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <LinearGradient colors={['#6366F1', '#A855F7']} style={styles.avatar}>
                  <View style={styles.avatarInner}><User size={24} color="#6366F1" /></View>
                </LinearGradient>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.title}>{item.title}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                  <Heart size={22} color={favorites.includes(item.id) ? "#EF4444" : "#CBD5E1"} fill={favorites.includes(item.id) ? "#EF4444" : "none"} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{formatPrice(item.hourlyRate)}</Text>
                  <Text style={styles.unit}>/hr</Text>
                </View>
                <View style={styles.ratingBox}>
                   <Star size={12} color="#F59E0B" fill="#F59E0B" />
                   <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FILTER MODAL - No changes here */}
      <Modal visible={isFilterVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Results</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}><X size={24} color="#1E293B" /></TouchableOpacity>
            </View>

            <Text style={styles.label}>Max Hourly Rate: {activeCurrency.symbol}{maxPrice}</Text>
            <View style={styles.priceOptions}>
               {[0.25, 0.5, 0.75, 1].map(percent => {
                 const val = Math.round(activeCurrency.maxSlider * percent);
                 return (
                   <TouchableOpacity 
                    key={percent} 
                    onPress={() => setMaxPrice(val)}
                    style={[styles.chip, maxPrice === val && styles.chipActive]}
                   >
                     <Text style={[styles.chipText, maxPrice === val && styles.chipTextActive]}>
                       {activeCurrency.symbol}{val}
                     </Text>
                   </TouchableOpacity>
                 );
               })}
            </View>

            <Text style={styles.label}>Minimum Rating</Text>
            <View style={styles.priceOptions}>
               {[0, 4.0, 4.5, 4.8].map(r => (
                 <TouchableOpacity key={r} onPress={() => setMinRating(r)} style={[styles.chip, minRating === r && styles.chipActive]}>
                   <Text style={[styles.chipText, minRating === r && styles.chipTextActive]}>{r === 0 ? 'Any' : `${r}★`}</Text>
                 </TouchableOpacity>
               ))}
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={() => setIsFilterVisible(false)}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: '#FFF', paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' }, // New container
  backArrow: { marginRight: 12, padding: 4 }, // Added spacing
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B' },
  headerActions: { flexDirection: 'row', gap: 12 },
  currencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', padding: 8, borderRadius: 12 },
  currencyText: { fontSize: 12, fontWeight: '800', color: '#6366F1' },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  favBtnActive: { backgroundColor: '#EF4444' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#6366F1', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 10 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontWeight: '600', color: '#1E293B' },
  filterBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  filterBtnActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  list: { paddingHorizontal: 24 },
  resultsCount: { fontSize: 10, fontWeight: '800', color: '#94A3B8', marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 16, padding: 2 },
  avatarInner: { flex: 1, backgroundColor: '#FFF', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  title: { fontSize: 12, color: '#64748B' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F8FAFC' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
  unit: { fontSize: 11, color: '#94A3B8' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: '800', color: '#B45309' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', padding: 24, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  label: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 12, marginTop: 10 },
  priceOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F1F5F9' },
  chipActive: { backgroundColor: '#1E293B' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  chipTextActive: { color: '#FFF' },
  applyBtn: { backgroundColor: '#6366F1', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  applyBtnText: { color: '#FFF', fontWeight: '800' },
  empty: { alignItems: 'center', marginTop: 40, opacity: 0.4 },
  emptyText: { marginTop: 10, fontWeight: '700' }
});