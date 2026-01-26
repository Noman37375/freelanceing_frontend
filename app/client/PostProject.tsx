import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, Briefcase, MapPin, 
  Tag as TagIcon, Calendar, Plus, ChevronDown, X 
} from 'lucide-react-native';

// Configuration
const CURRENCIES = [
  { id: 'USD', symbol: '$', rate: 1 },
  { id: 'PKR', symbol: 'Rs', rate: 280.50 },
  { id: 'EUR', symbol: '€', rate: 0.92 },
];

const CATEGORIES = ["Web Development", "Mobile App", "UI/UX Design", "Writing", "Marketing"];

const PRESET_SKILLS = [
  "React Native", "Node.js", "Python", "Figma", "TypeScript", 
  "GraphQL", "AWS", "SEO", "Copywriting", "SQL"
];

export default function CreateProject() {
  const router = useRouter();

  // Input State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [duration, setDuration] = useState('');
  
  // Dropdown States
  const [activeCurr, setActiveCurr] = useState(CURRENCIES[0]);
  const [showCurrMenu, setShowCurrMenu] = useState(false);
  const [showSkillMenu, setShowSkillMenu] = useState(false);

  // Tags/Skills State
  const [tagInput, setTagInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setTagInput('');
      setShowSkillMenu(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skillToRemove));
  };

  const handlePostProject = () => {
    if (!title || !description || !budget || selectedSkills.length === 0) {
      Alert.alert("Required", "Please fill in title, description, budget, and at least one skill.");
      return;
    }

    // Convert to base USD for database
    const baseBudgetUSD = (parseFloat(budget) / activeCurr.rate).toFixed(2);

    const projectPayload = {
      id: `PROJ-${Math.floor(Math.random() * 90000) + 10000}`,
      client_id: "user_client_88", 
      title,
      description,
      budget: baseBudgetUSD,
      posted_currency: activeCurr.id,
      location,
      tags: selectedSkills,
      category,
      duration,
      status: "ACTIVE",
      bids_count: 0,
      created_at: new Date().toISOString(),
    };

    console.log("Saving Project:", projectPayload);
    Alert.alert("Success", "Project posted!");
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Project</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        <Text style={styles.label}>PROJECT TITLE</Text>
        <View style={styles.inputBox}>
          <Briefcase size={18} color="#94A3B8" />
          <TextInput style={styles.input} placeholder="e.g. Mobile App" value={title} onChangeText={setTitle} />
        </View>

        <Text style={styles.label}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 10}}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipTxt, category === cat && styles.chipTxtActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput 
          style={styles.textArea} 
          multiline placeholder="Project requirements..." 
          value={description} onChangeText={setDescription}
        />

        <View style={styles.row}>
          <View style={{ flex: 1.2 }}>
            <Text style={styles.label}>BUDGET</Text>
            <View style={styles.budgetInputContainer}>
              <TouchableOpacity style={styles.currencySelector} onPress={() => setShowCurrMenu(!showCurrMenu)}>
                <Text style={styles.currencySymbol}>{activeCurr.symbol}</Text>
                <ChevronDown size={14} color="#6366F1" />
              </TouchableOpacity>
              <TextInput style={styles.budgetTextInput} keyboardType="numeric" placeholder="0.00" value={budget} onChangeText={setBudget} />
            </View>
            {showCurrMenu && (
              <View style={styles.dropdownMenu}>
                {CURRENCIES.map(curr => (
                  <TouchableOpacity key={curr.id} style={styles.menuOption} onPress={() => { setActiveCurr(curr); setShowCurrMenu(false); }}>
                    <Text style={styles.menuOptionTxt}>{curr.id} ({curr.symbol})</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.label}>DURATION</Text>
            <View style={styles.inputBox}>
              <Calendar size={18} color="#94A3B8" />
              <TextInput style={styles.input} placeholder="30 Days" value={duration} onChangeText={setDuration} />
            </View>
          </View>
        </View>

        <Text style={styles.label}>LOCATION</Text>
        <View style={styles.inputBox}>
          <MapPin size={18} color="#94A3B8" />
          <TextInput style={styles.input} placeholder="Remote / City" value={location} onChangeText={setLocation} />
        </View>

        {/* HYBRID SKILLS SELECTOR */}
        <Text style={styles.label}>REQUIRED SKILLS</Text>
        <View style={styles.inputBox}>
          <TagIcon size={18} color="#94A3B8" />
          <TextInput 
            style={styles.input} 
            placeholder="Search or type skill..." 
            value={tagInput}
            onChangeText={(text) => { setTagInput(text); setShowSkillMenu(text.length > 0); }}
            onFocus={() => setShowSkillMenu(true)}
          />
          <TouchableOpacity onPress={() => addSkill(tagInput)}><Plus size={22} color="#6366F1" /></TouchableOpacity>
        </View>

        {showSkillMenu && (
          <View style={styles.dropdownMenu}>
            <ScrollView style={{maxHeight: 150}} nestedScrollEnabled keyboardShouldPersistTaps="always">
              {PRESET_SKILLS.filter(s => s.toLowerCase().includes(tagInput.toLowerCase())).map(skill => (
                <TouchableOpacity key={skill} style={styles.menuOption} onPress={() => addSkill(skill)}>
                  <Text style={styles.menuOptionTxt}>{skill}</Text>
                </TouchableOpacity>
              ))}
              {tagInput.length > 0 && !PRESET_SKILLS.includes(tagInput) && (
                <TouchableOpacity style={styles.menuOption} onPress={() => addSkill(tagInput)}>
                  <Text style={[styles.menuOptionTxt, {color: '#6366F1'}]}>Add "{tagInput}"</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}

        <View style={styles.tagWrap}>
          {selectedSkills.map(s => (
            <TouchableOpacity key={s} style={styles.tag} onPress={() => removeSkill(s)}>
              <Text style={styles.tagTxt}>{s}</Text>
              <X size={12} color="#4F46E5" style={{marginLeft: 6}} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handlePostProject}>
          <Text style={styles.submitBtnText}>Post Project</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFF' },
  backBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  scrollContent: { padding: 20 },
  label: { fontSize: 11, fontWeight: '900', color: '#94A3B8', marginBottom: 8, marginTop: 15, letterSpacing: 0.5 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, gap: 10 },
  input: { flex: 1, height: 48, color: '#1E293B', fontWeight: '600' },
  budgetInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  currencySelector: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingHorizontal: 12, height: 48, borderRightWidth: 1, borderRightColor: '#E2E8F0' },
  currencySymbol: { fontWeight: '800', color: '#6366F1', fontSize: 15 },
  budgetTextInput: { flex: 1, height: 48, paddingHorizontal: 12, fontSize: 16, fontWeight: '700' },
  dropdownMenu: { backgroundColor: '#FFF', borderRadius: 12, marginTop: 4, borderWidth: 1, borderColor: '#E2E8F0', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, zIndex: 100 },
  menuOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuOptionTxt: { fontSize: 13, fontWeight: '700', color: '#475569' },
  textArea: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12, height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  chipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  chipTxt: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  chipTxtActive: { color: '#FFF' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#C7D2FE' },
  tagTxt: { color: '#4F46E5', fontWeight: '700', fontSize: 12 },
  footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  submitBtn: { backgroundColor: '#6366F1', height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});