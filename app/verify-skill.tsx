import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Modal,
  AppState,
  AppStateStatus,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, ChevronDown, Code2, Award, Briefcase,
  CheckCircle2, Send, XCircle, Clock, Trophy, Github,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { badgeService } from '@/services/badgeService';
import * as ScreenCapture from 'expo-screen-capture';
import * as WebBrowser from 'expo-web-browser';

type Step = 'choose_type' | 'choose_skill_level' | 'choose_skill' | 'choose_level' | 'coding_test' | 'quiz' | 'certificate' | 'codeforces' | 'github' | 'youtube' | 'result';
type VerifyType = 'developer' | 'designer' | 'creative' | 'competitive' | 'github' | 'youtube';
type BadgeLevel = 'Bronze' | 'Silver' | 'Gold';

// All 12 supported languages grouped by difficulty
const CODING_SKILLS: { name: string; difficulty: 'Easy' | 'Medium' | 'Hard' }[] = [
  { name: 'Python',     difficulty: 'Medium' },
  { name: 'JavaScript', difficulty: 'Medium' },
  { name: 'Java',       difficulty: 'Easy'   },
  { name: 'C++',        difficulty: 'Medium' },
  { name: 'C',          difficulty: 'Easy'   },
  { name: 'Go',         difficulty: 'Medium' },
  { name: 'Ruby',       difficulty: 'Easy'   },
  { name: 'Rust',       difficulty: 'Hard'   },
  { name: 'PHP',        difficulty: 'Easy'   },
  { name: 'TypeScript', difficulty: 'Medium' },
  { name: 'C#',         difficulty: 'Easy'   },
  { name: 'Swift',      difficulty: 'Medium' },
  { name: 'Kotlin',     difficulty: 'Easy'   },
];

const CERT_SKILLS = [
  'Digital Marketing', 'UI/UX Design', 'Graphic Design',
  'Content Writing', 'SEO', 'Video Editing', 'Figma',
  'Adobe Photoshop', 'Data Analysis',
];
const CERT_PROVIDERS = ['Coursera', 'Google Skillshop', 'Adobe', 'HubSpot', 'LinkedIn Learning', 'Other'];

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  Easy:   { bg: '#F0FDF4', text: '#16A34A' },
  Medium: { bg: '#FFFBEB', text: '#D97706' },
  Hard:   { bg: '#FEF2F2', text: '#DC2626' },
};

// File extensions for the IDE header
const LANG_EXT: Record<string, string> = {
  Python: 'py', JavaScript: 'js', Java: 'java', 'C++': 'cpp',
  C: 'c', Go: 'go', Ruby: 'rb', Rust: 'rs', PHP: 'php',
  TypeScript: 'ts', 'C#': 'cs', Swift: 'swift', Kotlin: 'kt',
};

// Starter code placeholders
const CODE_PLACEHOLDER: Record<string, string> = {
  Python:     '# Write your Python solution here\n\nn = int(input())\nnums = list(map(int, input().split()))\n',
  JavaScript: '// Write your JS solution here\nconst lines = require("fs").readFileSync("/dev/stdin","utf8").trim().split("\\n");\n',
  Java:       '// Write your Java solution here\nimport java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n    }\n}',
  'C++':      '// Write your C++ solution here\n#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    \n    return 0;\n}',
  C:          '// Write your C solution here\n#include <stdio.h>\nint main() {\n    \n    return 0;\n}',
  Go:         '// Write your Go solution here\npackage main\nimport "fmt"\nfunc main() {\n    \n}',
  Ruby:       '# Write your Ruby solution here\n',
  Rust:       '// Write your Rust solution here\nuse std::io::{self, BufRead};\nfn main() {\n    \n}',
  PHP:        '<?php\n// Write your PHP solution here\n',
  TypeScript: '// Write your TypeScript solution here\nconst lines = require("fs").readFileSync("/dev/stdin","utf8").trim().split("\\n");\n',
  'C#':       '// Write your C# solution here\nusing System;\nclass Solution {\n    static void Main() {\n        \n    }\n}',
  Swift:      '// Write your Swift solution here\nimport Foundation\n',
  Kotlin:     '// Write your Kotlin solution here\nfun main() {\n    \n}',
};

// ── Level config: defined at module level so all render fns can access it ────
const LEVEL_CONFIG: Record<BadgeLevel, {
  color: string; bg: string; border: string;
  icon: string; desc: string; passReq: string;
}> = {
  Bronze: {
    color: '#C2773A', bg: '#FEF2E8', border: '#C2773A',
    icon: '🥉', desc: 'Beginner job-interview — 12 MCQ + 8 output prediction',
    passReq: 'Answer 14/20 correctly (70%+)',
  },
  Silver: {
    color: '#94A3B8', bg: '#F1F5F9', border: '#94A3B8',
    icon: '🥈', desc: 'Mid-level interview — 20 MCQ + 20 output prediction',
    passReq: 'Answer 28/40 correctly (70%+) • Requires Bronze',
  },
  Gold: {
    color: '#F59E0B', bg: '#FEF3C7', border: '#F59E0B',
    icon: '🥇', desc: 'Senior interview — 20 MCQ + 30 output prediction',
    passReq: 'Answer 35/50 correctly (70%+) • Requires Silver',
  },
};

const LEVEL_ORDER: BadgeLevel[] = ['Bronze', 'Silver', 'Gold'];

// Seconds per question per level
const QUIZ_TIMER: Record<BadgeLevel, number> = { Bronze: 45, Silver: 60, Gold: 90 };
// Max app-background events before quiz is disqualified
const MAX_CHEAT_WARNINGS = 3;

interface TestQuestion {
  title: string;
  difficulty: string;
  language_id: number;
  description: string;
  inputFormat: string;
  outputFormat: string;
  example: { input: string; output: string };
  totalTestCases: number;
}

interface QuizQuestion {
  id: number;
  type: 'mcq' | 'output';
  q: string;
  // MCQ only
  A?: string;
  B?: string;
  C?: string;
  D?: string;
  // Output only
  code?: string;
}

interface QuizSession {
  sessionToken: string;
  questions: QuizQuestion[];
  total: number;
  level: string;
  skill: string;
  passPercent: number;
}

interface QuizResult {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  breakdown: { id: number; userAnswer: string | null; correctAnswer: string; passed: boolean }[];
  badge: { badgeLevel: string } | null;
}

interface TestCaseResult {
  case: number;
  passed: boolean;
  statusDesc: string;
  time: number;
}

interface RunResult {
  stdout: string;
  stderr: string;
  compileOutput: string;
  statusId: number;
  statusDesc: string;
  time: string | null;
  memory: number | null;
}

interface SubmitResult {
  score: number;
  passed: boolean;
  testResults: TestCaseResult[];
  passedCount: number;
  totalCount: number;
  badge?: { badgeLevel: string } | null;
  compilationError?: string;
}

export default function VerifySkillScreen() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('choose_type');
  const [verifyType, setVerifyType] = useState<VerifyType | null>(null);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<BadgeLevel>('Silver');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [testQuestion, setTestQuestion] = useState<TestQuestion | null>(null);
  const [sourceCode, setSourceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [certSubmitted, setCertSubmitted] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runLoading, setRunLoading] = useState(false);
  const [customStdin, setCustomStdin] = useState('');
  const [stdinVisible, setStdinVisible] = useState(false);
  const [cfHandle, setCfHandle] = useState('');
  const [cfResult, setCfResult] = useState<{
    handle: string; rating: number; maxRating: number; rank: string;
    effectiveRating?: number; badge: { badgeLevel: string } | null;
  } | null>(null);

  // GitHub OAuth state
  const githubOAuthPendingRef = useRef(false);
  const [githubDone, setGithubDone] = useState(false);

  // YouTube OAuth state
  const youtubeOAuthPendingRef = useRef(false);
  const [youtubeDone, setYoutubeDone] = useState(false);

  // Quiz state
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizCurrentIdx, setQuizCurrentIdx] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizDisqualified, setQuizDisqualified] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalTimeRef = useRef(0);

  // Cheat detection
  const cheatCountRef = useRef(0);
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const quizSessionRef = useRef<QuizSession | null>(null);

  // (time tracking handled server-side via JWT startedAt)
  // Highest badge level already earned for the selected skill (for progressive locking)
  const [earnedLevel, setEarnedLevel] = useState<BadgeLevel | null>(null);
  // Dropdown open states
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [levelCheckLoading, setLevelCheckLoading] = useState(false);

  // Keep quizSessionRef in sync so AppState handler can access it
  useEffect(() => { quizSessionRef.current = quizSession; }, [quizSession]);

  // ── Per-question countdown timer ──────────────────────────────
  useEffect(() => {
    if (step !== 'quiz' || !quizSession) return;

    const seconds = QUIZ_TIMER[selectedLevel as BadgeLevel] ?? 60;
    totalTimeRef.current = seconds;
    setTimeLeft(seconds);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-advance to next question when time runs out
          setQuizCurrentIdx(cur => {
            const total = quizSessionRef.current?.total ?? 1;
            return Math.min(cur + 1, total - 1);
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current!); };
  }, [quizCurrentIdx, step]);

  // ── AppState / Tab-switch cheat detection ─────────────────────
  useEffect(() => {
    if (step !== 'quiz') return;

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        cheatCountRef.current += 1;
        const count = cheatCountRef.current;
        setCheatWarnings(count);

        if (count >= MAX_CHEAT_WARNINGS) {
          // Pause timer
          if (timerRef.current) clearInterval(timerRef.current);
          setQuizDisqualified(true);
          setStep('result');
          Alert.alert(
            '🚫 Quiz Terminated',
            'You switched apps 3 times during the quiz. Your attempt has been disqualified.\n\nUsing AI tools (ChatGPT, Copilot, Gemini, Bing AI) or any browser AI assistant during the quiz is not allowed.',
            [{ text: 'OK', style: 'destructive' }]
          );
        } else {
          const remaining = MAX_CHEAT_WARNINGS - count;
          Alert.alert(
            `⚠️ Cheating Detected (${count}/${MAX_CHEAT_WARNINGS})`,
            `We detected you left the quiz app.\n\nUsing AI tools like ChatGPT, GitHub Copilot, Gemini, Bing AI, or any browser AI extension is strictly not allowed.\n\n${remaining} more switch${remaining > 1 ? 'es' : ''} will permanently disqualify this attempt.`,
            [{ text: 'I Understand — Resume Quiz', style: 'default' }]
          );
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [step]);

  // ── Screenshot / screen recording prevention (native only) ───
  useEffect(() => {
    if (step !== 'quiz' || Platform.OS === 'web') return;
    ScreenCapture.preventScreenCaptureAsync();
    return () => { ScreenCapture.allowScreenCaptureAsync(); };
  }, [step]);


  const handleTypeSelect = (type: VerifyType) => {
    setVerifyType(type);
    if (type === 'creative') setStep('result');
    else if (type === 'competitive') setStep('codeforces');
    else if (type === 'github') {
      setGithubDone(false);
      setStep('github');
    }
    else if (type === 'youtube') {
      setYoutubeDone(false);
      setStep('youtube');
    }
    else if (type === 'developer') {
      // Reset selections for developer flow
      setSelectedSkill('');
      setSelectedLevel('' as any);
      setEarnedLevel(null);
      setStep('choose_skill_level');
    }
    else setStep('choose_skill');
  };

  // Called when user picks a language in the dropdown
  const handleLanguageChange = async (skill: string) => {
    setSelectedSkill(skill);
    setSelectedLevel('' as any); // reset level when language changes
    setLangModalOpen(false);
    setLevelCheckLoading(true);
    try {
      const { badges } = await badgeService.getMyBadges();
      const existing = badges.find((b: any) => b.skill === skill && b.status === 'active');
      setEarnedLevel((existing?.badgeLevel as BadgeLevel) ?? null);
    } catch {
      setEarnedLevel(null);
    } finally {
      setLevelCheckLoading(false);
    }
  };

  // Track whether user went through CF OAuth so we can refresh badges on return
  const cfOAuthPendingRef = useRef(false);

  // When user comes back from the browser after CF OAuth, show success screen
  useEffect(() => {
    if (step !== 'codeforces') return;
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active' && cfOAuthPendingRef.current) {
        cfOAuthPendingRef.current = false;
        // Show "check your profile" result — badge was awarded server-side
        setCfResult({ handle: '', rating: 0, maxRating: 0, rank: '', badge: null, oauthDone: true } as any);
        setStep('result');
      }
    });
    return () => sub.remove();
  }, [step]);

  const handleCFLogin = async () => {
    setLoading(true);
    try {
      const { authUrl } = await badgeService.getCodeforcesAuthUrl();
      cfOAuthPendingRef.current = true;
      await WebBrowser.openBrowserAsync(authUrl);
    } catch (e: any) {
      cfOAuthPendingRef.current = false;
      Alert.alert('Error', e.message || 'Failed to open Codeforces login');
    } finally {
      setLoading(false);
    }
  };

  // GitHub OAuth — AppState listener: when user returns from browser after authorizing
  useEffect(() => {
    if (step !== 'github') return;
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active' && githubOAuthPendingRef.current) {
        githubOAuthPendingRef.current = false;
        setGithubDone(true);
        setStep('result');
      }
    });
    return () => sub.remove();
  }, [step]);

  const handleGithubLogin = async () => {
    setLoading(true);
    try {
      const { authUrl } = await badgeService.getGithubAuthUrl();
      githubOAuthPendingRef.current = true;
      await WebBrowser.openBrowserAsync(authUrl);
    } catch (e: any) {
      githubOAuthPendingRef.current = false;
      Alert.alert('Error', e.message || 'Failed to open GitHub login');
    } finally {
      setLoading(false);
    }
  };

  // YouTube OAuth — AppState listener: when user returns from browser after authorizing
  useEffect(() => {
    if (step !== 'youtube') return;
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active' && youtubeOAuthPendingRef.current) {
        youtubeOAuthPendingRef.current = false;
        setYoutubeDone(true);
        setStep('result');
      }
    });
    return () => sub.remove();
  }, [step]);

  const handleYoutubeLogin = async () => {
    setLoading(true);
    try {
      const { authUrl } = await badgeService.getYoutubeAuthUrl();
      youtubeOAuthPendingRef.current = true;
      await WebBrowser.openBrowserAsync(authUrl);
    } catch (e: any) {
      youtubeOAuthPendingRef.current = false;
      Alert.alert('Error', e.message || 'Failed to open Google login');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillSelect = async (skill: string) => {
    setSelectedSkill(skill);
    if (verifyType === 'developer') {
      setLoading(true);
      try {
        // Check which badge level (if any) the user already holds for this skill
        const { badges } = await badgeService.getMyBadges();
        const existing = badges.find(
          (b: any) => b.skill === skill && b.status === 'active'
        );
        setEarnedLevel((existing?.badgeLevel as BadgeLevel) ?? null);
      } catch {
        setEarnedLevel(null);
      } finally {
        setLoading(false);
      }
      setStep('choose_level');
    } else {
      setStep('certificate');
    }
  };

  const handleLevelSelect = async (level: BadgeLevel) => {
    setSelectedLevel(level);
    setQuizAnswers({});
    setQuizCurrentIdx(0);
    setQuizResult(null);
    setQuizDisqualified(false);
    cheatCountRef.current = 0;
    setCheatWarnings(0);
    if (timerRef.current) clearInterval(timerRef.current);
    setLoading(true);
    try {
      const session = await badgeService.startQuiz(selectedSkill, level);
      setQuizSession(session);
      setStep('quiz');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
    if (!sourceCode.trim()) {
      Alert.alert('Error', 'Please write some code first');
      return;
    }
    if (!testQuestion) return;
    setRunLoading(true);
    setRunResult(null);
    try {
      const result = await badgeService.runCode(
        sourceCode.trim(),
        selectedSkill,
        customStdin
      );
      setRunResult(result);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to run code');
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!sourceCode.trim()) {
      Alert.alert('Error', 'Please write your code solution first');
      return;
    }
    setLoading(true);
    try {
      const data = await badgeService.submitCodingResult(selectedSkill, selectedLevel, sourceCode.trim()) as any;
      setSubmitResult(data);
      setStep('result');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to evaluate code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCertificate = async () => {
    if (!certUrl.trim()) { Alert.alert('Error', 'Please enter your certificate URL'); return; }
    if (!selectedProvider) { Alert.alert('Error', 'Please select the certificate provider'); return; }
    setLoading(true);
    try {
      await badgeService.submitCertificate(selectedSkill, certUrl.trim(), selectedProvider);
      setCertSubmitted(true);
      setStep('result');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'choose_skill_level') setStep('choose_type');
    else if (step === 'choose_skill') setStep('choose_type');
    else if (step === 'coding_test') setStep('choose_skill_level');
    else if (step === 'quiz') setStep('choose_skill_level');
    else if (step === 'certificate') setStep('choose_skill');
    else if (step === 'codeforces') setStep('choose_type');
    else if (step === 'github')     setStep('choose_type');
    else if (step === 'youtube')    setStep('choose_type');
    else router.back();
  };

  // ── Step: Choose Type ────────────────────────────────────────
  const renderChooseType = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>What type of freelancer are you?</Text>
      <Text style={styles.pageSubtitle}>We'll match you with the right verification method</Text>

      <TouchableOpacity style={styles.typeCard} onPress={() => handleTypeSelect('developer')} activeOpacity={0.8}>
        <View style={[styles.typeIcon, { backgroundColor: '#EEF2FF' }]}>
          <Code2 size={28} color="#4F46E5" strokeWidth={2} />
        </View>
        <View style={styles.typeInfo}>
          <Text style={styles.typeTitle}>Developer / Programmer</Text>
          <Text style={styles.typeDesc}>13 languages — Python, JS, Java, C++, Go, Rust & more</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.typeCard} onPress={() => handleTypeSelect('designer')} activeOpacity={0.8}>
        <View style={[styles.typeIcon, { backgroundColor: '#FFF7ED' }]}>
          <Award size={28} color="#F97316" strokeWidth={2} />
        </View>
        <View style={styles.typeInfo}>
          <Text style={styles.typeTitle}>Designer / Marketer</Text>
          <Text style={styles.typeDesc}>Submit a certificate from Coursera, Google, Adobe & more</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.typeCard} onPress={() => handleTypeSelect('competitive')} activeOpacity={0.8}>
        <View style={[styles.typeIcon, { backgroundColor: '#FEF3C7' }]}>
          <Trophy size={28} color="#F59E0B" strokeWidth={2} />
        </View>
        <View style={styles.typeInfo}>
          <Text style={styles.typeTitle}>Competitive Programmer</Text>
          <Text style={styles.typeDesc}>Link your Codeforces handle — rated instantly from your CF rating</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.typeCard} onPress={() => handleTypeSelect('github')} activeOpacity={0.8}>
        <View style={[styles.typeIcon, { backgroundColor: '#F0F0FF' }]}>
          <Github size={28} color="#6E40C9" strokeWidth={2} />
        </View>
        <View style={styles.typeInfo}>
          <Text style={styles.typeTitle}>GitHub Developer</Text>
          <Text style={styles.typeDesc}>Auto-scored from your public repos, stars & activity</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.typeCard} onPress={() => handleTypeSelect('youtube')} activeOpacity={0.8}>
        <View style={[styles.typeIcon, { backgroundColor: '#FFF1F1' }]}>
          <Award size={28} color="#FF0000" strokeWidth={2} />
        </View>
        <View style={styles.typeInfo}>
          <Text style={styles.typeTitle}>YouTube Content Creator</Text>
          <Text style={styles.typeDesc}>Verify via Google OAuth — scored from your real channel stats</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.typeCard} onPress={() => handleTypeSelect('creative')} activeOpacity={0.8}>
        <View style={[styles.typeIcon, { backgroundColor: '#F0FDF4' }]}>
          <Briefcase size={28} color="#16A34A" strokeWidth={2} />
        </View>
        <View style={styles.typeInfo}>
          <Text style={styles.typeTitle}>Creative / Writer / Editor</Text>
          <Text style={styles.typeDesc}>Verified through your portfolio by admins</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  // ── Step: Choose Skill ───────────────────────────────────────
  const renderChooseSkill = () => {
    const skills = verifyType === 'developer' ? CODING_SKILLS : CERT_SKILLS.map(s => ({ name: s, difficulty: null }));
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Select a skill to verify</Text>
        <Text style={styles.pageSubtitle}>
          {verifyType === 'developer'
            ? 'You will take a live coding test with 5 test cases'
            : 'You will submit a certificate for review'}
        </Text>

        {verifyType === 'developer' && (
          <View style={styles.diffLegend}>
            {(['Easy', 'Medium', 'Hard'] as const).map(d => (
              <View key={d} style={[styles.diffDot, { backgroundColor: DIFFICULTY_STYLE[d].bg }]}>
                <Text style={[styles.diffDotText, { color: DIFFICULTY_STYLE[d].text }]}>{d}</Text>
              </View>
            ))}
          </View>
        )}

        {(skills as any[]).map((skill: any) => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          const diff = typeof skill === 'string' ? null : skill.difficulty;
          return (
            <TouchableOpacity
              key={skillName}
              style={styles.skillRow}
              onPress={() => handleSkillSelect(skillName)}
              activeOpacity={0.8}
              disabled={loading}
            >
              <View style={styles.skillRowLeft}>
                <Text style={styles.skillRowText}>{skillName}</Text>
                {diff && (
                  <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_STYLE[diff].bg }]}>
                    <Text style={[styles.diffBadgeText, { color: DIFFICULTY_STYLE[diff].text }]}>{diff}</Text>
                  </View>
                )}
              </View>
              {loading && selectedSkill === skillName
                ? <ActivityIndicator size="small" color="#444751" />
                : <ChevronLeft size={18} color="#C2C2C8" style={{ transform: [{ rotate: '180deg' }] }} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  // ── Step: Choose Skill + Level (developer flow) ──────────────
  const renderChooseSkillLevel = () => {
    const earnedIdx = earnedLevel ? LEVEL_ORDER.indexOf(earnedLevel) : -1;

    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Select Language & Level</Text>
        <Text style={styles.pageSubtitle}>Mixed quiz: MCQ + predict code output. Bronze = 20 Qs · Silver = 40 Qs · Gold = 50 Qs. New questions every attempt.</Text>

        {/* ── Language Dropdown ─────────────────────── */}
        <Text style={styles.dropLabel}>LANGUAGE</Text>
        <TouchableOpacity
          style={styles.dropBtn}
          onPress={() => setLangModalOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={selectedSkill ? styles.dropBtnValue : styles.dropBtnPlaceholder}>
            {selectedSkill || 'Select a language...'}
          </Text>
          <ChevronDown size={18} color="#444751" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* ── Level Dropdown ────────────────────────── */}
        <Text style={[styles.dropLabel, { marginTop: 20 }]}>BADGE LEVEL</Text>
        <TouchableOpacity
          style={[styles.dropBtn, (!selectedSkill || levelCheckLoading) && { opacity: 0.5 }]}
          onPress={() => selectedSkill && !levelCheckLoading && setLevelModalOpen(true)}
          activeOpacity={0.8}
          disabled={!selectedSkill || levelCheckLoading}
        >
          {levelCheckLoading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color="#444751" />
              <Text style={styles.dropBtnPlaceholder}>Checking your badges...</Text>
            </View>
          ) : selectedLevel ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 20 }}>{LEVEL_CONFIG[selectedLevel as BadgeLevel].icon}</Text>
              <Text style={[styles.dropBtnValue, { color: LEVEL_CONFIG[selectedLevel as BadgeLevel].color }]}>
                {selectedLevel} Badge
              </Text>
            </View>
          ) : (
            <Text style={styles.dropBtnPlaceholder}>
              {selectedSkill ? 'Select a level...' : 'Select a language first'}
            </Text>
          )}
          <ChevronDown size={18} color="#444751" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* ── Selected Level Info Card ──────────────── */}
        {selectedLevel && (
          <View style={[styles.selectedLevelCard, {
            borderColor: LEVEL_CONFIG[selectedLevel as BadgeLevel].border,
            backgroundColor: LEVEL_CONFIG[selectedLevel as BadgeLevel].bg,
          }]}>
            <Text style={[styles.selectedLevelTitle, { color: LEVEL_CONFIG[selectedLevel as BadgeLevel].color }]}>
              {LEVEL_CONFIG[selectedLevel as BadgeLevel].icon}  {selectedLevel} Badge — {selectedSkill}
            </Text>
            <Text style={styles.selectedLevelDesc}>{LEVEL_CONFIG[selectedLevel as BadgeLevel].desc}</Text>
            <Text style={styles.selectedLevelReq}>{LEVEL_CONFIG[selectedLevel as BadgeLevel].passReq}</Text>
          </View>
        )}

        {/* ── Start Test Button ────────────────────── */}
        <TouchableOpacity
          style={[styles.startTestBtn, (!selectedSkill || !selectedLevel || loading) && { opacity: 0.4 }]}
          onPress={() => handleLevelSelect(selectedLevel as BadgeLevel)}
          disabled={!selectedSkill || !selectedLevel || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#282A32" size="small" />
          ) : (
            <>
              <Text style={styles.startTestBtnText}>Start Quiz</Text>
              <ChevronLeft size={20} color="#282A32" strokeWidth={3} style={{ transform: [{ rotate: '180deg' }] }} />
            </>
          )}
        </TouchableOpacity>

        {/* ── Language Modal ───────────────────────── */}
        <Modal visible={langModalOpen} transparent animationType="slide" onRequestClose={() => setLangModalOpen(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLangModalOpen(false)}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select Language</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {CODING_SKILLS.map(s => (
                  <TouchableOpacity
                    key={s.name}
                    style={[styles.modalOption, selectedSkill === s.name && styles.modalOptionActive]}
                    onPress={() => handleLanguageChange(s.name)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modalOptionText, selectedSkill === s.name && { color: '#4F46E5' }]}>
                        {s.name}
                      </Text>
                    </View>
                    {selectedSkill === s.name && <CheckCircle2 size={18} color="#4F46E5" strokeWidth={2.5} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ── Level Modal ──────────────────────────── */}
        <Modal visible={levelModalOpen} transparent animationType="slide" onRequestClose={() => setLevelModalOpen(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLevelModalOpen(false)}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select Level</Text>
              {LEVEL_ORDER.map((level, idx) => {
                const cfg = LEVEL_CONFIG[level];
                const locked = idx > 0 && earnedIdx < idx - 1;
                const earned = earnedIdx >= idx;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[styles.modalOption, locked && { opacity: 0.4 }, selectedLevel === level && styles.modalOptionActive]}
                    onPress={() => { if (!locked) { setSelectedLevel(level); setLevelModalOpen(false); } }}
                    disabled={locked}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 26, marginRight: 12 }}>{locked ? '🔒' : cfg.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.modalOptionText, { color: locked ? '#C2C2C8' : cfg.color }]}>{level} Badge</Text>
                        {earned && (
                          <View style={[styles.earnedPill, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
                            <Text style={[styles.earnedPillText, { color: cfg.color }]}>Earned</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.modalOptionSub}>
                        {locked ? `Earn ${LEVEL_ORDER[idx - 1]} first` : cfg.desc}
                      </Text>
                    </View>
                    {selectedLevel === level && !locked && <CheckCircle2 size={18} color={cfg.color} strokeWidth={2.5} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    );
  };

  // ── Step: Choose Level ───────────────────────────────────────
  const renderChooseLevel = () => {
    const earnedIdx = earnedLevel ? LEVEL_ORDER.indexOf(earnedLevel) : -1;

    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Choose your badge level</Text>
        <Text style={styles.pageSubtitle}>
          Skill: <Text style={{ fontWeight: '700', color: '#282A32' }}>{selectedSkill}</Text>
          {'\n'}Unlock levels progressively — earn Bronze first.
        </Text>

        {LEVEL_ORDER.map((level, idx) => {
          const cfg = LEVEL_CONFIG[level];
          // Locked if user hasn't earned the previous level yet
          const isLocked = idx > 0 && earnedIdx < idx - 1;
          const isEarned = earnedIdx >= idx;

          return (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelCard,
                {
                  borderColor: isLocked ? '#E5E4EA' : cfg.border,
                  backgroundColor: isLocked ? '#F8F8FA' : cfg.bg,
                  opacity: isLocked ? 0.6 : 1,
                },
              ]}
              onPress={() => !isLocked && handleLevelSelect(level)}
              disabled={loading || isLocked}
              activeOpacity={isLocked ? 1 : 0.8}
            >
              <Text style={[styles.levelCardIcon, { opacity: isLocked ? 0.4 : 1 }]}>
                {isLocked ? '🔒' : cfg.icon}
              </Text>
              <View style={styles.levelCardInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.levelCardTitle, { color: isLocked ? '#C2C2C8' : cfg.color }]}>
                    {level} Badge
                  </Text>
                  {isEarned && (
                    <View style={[styles.earnedPill, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
                      <Text style={[styles.earnedPillText, { color: cfg.color }]}>Earned</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.levelCardDesc, { color: isLocked ? '#C2C2C8' : '#444751' }]}>
                  {cfg.desc}
                </Text>
                <Text style={[styles.levelCardReq, { color: isLocked ? '#D0D0D8' : '#94A3B8' }]}>
                  {isLocked
                    ? `Earn ${LEVEL_ORDER[idx - 1]} first to unlock`
                    : cfg.passReq}
                </Text>
              </View>
              {loading && selectedLevel === level
                ? <ActivityIndicator size="small" color={isLocked ? '#C2C2C8' : cfg.color} />
                : !isLocked && (
                  <ChevronLeft size={18} color={cfg.color} style={{ transform: [{ rotate: '180deg' }] }} />
                )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>You earn the badge at exactly the level you attempt.</Text>
          <Text style={styles.infoText}>Points: Bronze = 10 · Silver = 20 · Gold = 30</Text>
        </View>
      </ScrollView>
    );
  };

  // ── Step: Coding Test ────────────────────────────────────────
  const renderCodingTest = () => {
    if (!testQuestion) return null;
    const levelCfg = LEVEL_CONFIG[selectedLevel];
    const totalTC = testQuestion.totalTestCases;

    return (
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Dark IDE Header ──────────────────────────── */}
        <View style={styles.ideHeader}>
          <View style={styles.ideHeaderLeft}>
            {/* Traffic-light dots */}
            <View style={[styles.dot, { backgroundColor: '#FF5F57' }]} />
            <View style={[styles.dot, { backgroundColor: '#FEBC2E' }]} />
            <View style={[styles.dot, { backgroundColor: '#28C840' }]} />
          </View>
          <View style={styles.ideHeaderCenter}>
            <Text style={styles.ideFileName}>solution.{LANG_EXT[selectedSkill] ?? 'txt'}</Text>
          </View>
          <View style={[styles.diffBadgeDark, { backgroundColor: levelCfg.bg }]}>
            <Text style={[styles.diffBadgeDarkText, { color: levelCfg.color }]}>{selectedLevel}</Text>
          </View>
        </View>

        {/* ── Problem Statement Panel ──────────────────── */}
        <View style={styles.problemPanel}>
          {/* Title row */}
          <View style={styles.problemTitleRow}>
            <Text style={styles.problemTitle}>{testQuestion.title}</Text>
            <View style={styles.langTag}>
              <Text style={styles.langTagText}>{selectedSkill}</Text>
            </View>
          </View>

          <Text style={styles.problemDesc}>{testQuestion.description}</Text>

          {/* Divider */}
          <View style={styles.panelDivider} />

          {/* Input / Output format side by side */}
          <View style={styles.ioRow}>
            <View style={styles.ioBox}>
              <View style={styles.ioLabelRow}>
                <View style={[styles.ioAccent, { backgroundColor: '#6366F1' }]} />
                <Text style={styles.ioLabel}>Input Format</Text>
              </View>
              <Text style={styles.ioText}>{testQuestion.inputFormat}</Text>
            </View>
            <View style={[styles.ioBox, { borderLeftWidth: 1, borderLeftColor: '#E5E4EA', paddingLeft: 14 }]}>
              <View style={styles.ioLabelRow}>
                <View style={[styles.ioAccent, { backgroundColor: '#10B981' }]} />
                <Text style={styles.ioLabel}>Output Format</Text>
              </View>
              <Text style={styles.ioText}>{testQuestion.outputFormat}</Text>
            </View>
          </View>

          <View style={styles.panelDivider} />

          {/* Example */}
          <Text style={styles.exampleHeading}>Example</Text>
          <View style={styles.exampleDark}>
            <View style={styles.exampleDarkHalf}>
              <Text style={styles.exampleDarkLabel}>{'>'} Input</Text>
              <Text style={styles.exampleDarkCode}>{testQuestion.example.input}</Text>
            </View>
            <View style={styles.exampleDarkDivider} />
            <View style={styles.exampleDarkHalf}>
              <Text style={styles.exampleDarkLabel}>{'>'} Output</Text>
              <Text style={styles.exampleDarkCode}>{testQuestion.example.output}</Text>
            </View>
          </View>
        </View>

        {/* ── Test Case Progress Bar ───────────────────── */}
        <View style={styles.tcProgressBox}>
          <View style={styles.tcProgressHeader}>
            <Text style={styles.tcProgressTitle}>
              {totalTC} Hidden Test Cases
            </Text>
            <Text style={styles.tcProgressSub}>Your code runs against all of them</Text>
          </View>
          <View style={styles.tcBubbles}>
            {Array.from({ length: totalTC }).map((_, i) => (
              <View key={i} style={styles.tcBubble}>
                <Text style={styles.tcBubbleText}>{i + 1}</Text>
              </View>
            ))}
          </View>
          {/* Badge threshold */}
          <View style={styles.thresholdRow}>
            {(() => {
              const cfg = LEVEL_CONFIG[selectedLevel];
              return (
                <View style={[styles.thresholdItem, { backgroundColor: cfg.bg, borderRadius: 10, padding: 8, flex: 1 }]}>
                  <View style={[styles.thresholdDot, { backgroundColor: cfg.color }]} />
                  <Text style={styles.thresholdText}>
                    Pass 3/5+ → earn <Text style={{ fontWeight: '800', color: cfg.color }}>{selectedLevel} Badge</Text>
                  </Text>
                </View>
              );
            })()}</View>
        </View>

        {/* ── Dark Code Editor ─────────────────────────── */}
        <View style={styles.editorWrap}>
          {/* Editor top bar */}
          <View style={styles.editorTopBar}>
            <Text style={styles.editorTopLabel}>CODE EDITOR</Text>
            <Text style={styles.editorTopHint}>{sourceCode.split('\n').length} lines</Text>
          </View>
          {/* Line numbers + input */}
          <View style={styles.editorBody}>
            <View style={styles.lineNumbers} pointerEvents="none">
              {Array.from({ length: Math.max(sourceCode.split('\n').length, 12) }).map((_, i) => (
                <Text key={i} style={styles.lineNum}>{i + 1}</Text>
              ))}
            </View>
            <TextInput
              style={styles.codeInputDark}
              value={sourceCode}
              onChangeText={text => { setSourceCode(text); setRunResult(null); }}
              placeholder={CODE_PLACEHOLDER[selectedSkill] ?? `// Write your ${selectedSkill} solution here`}
              placeholderTextColor="#4A5568"
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* ── Stdin (Custom Input) ──────────────────────── */}
        <View style={styles.stdinWrap}>
          <TouchableOpacity
            style={styles.stdinToggle}
            onPress={() => setStdinVisible(v => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.stdinToggleLabel}>
              {stdinVisible ? '▾' : '▸'} Custom Input (stdin)
            </Text>
            <Text style={styles.stdinToggleHint}>
              {customStdin.trim() ? '✓ Input set' : 'Optional'}
            </Text>
          </TouchableOpacity>
          {stdinVisible && (
            <>
              <View style={styles.stdinHintBox}>
                <Text style={styles.stdinHintText}>
                  💡 Enter the <Text style={{ fontWeight: '800', color: '#CDD6F4' }}>raw data</Text> your program reads via{' '}
                  <Text style={{ fontWeight: '800', color: '#F0C040' }}>input()</Text> — one value per line.
                </Text>
                <Text style={styles.stdinHintExample}>
                  Example: if your code does{'\n'}
                  {'  '}n = int(input()){'\n'}
                  {'  '}nums = list(map(int, input().split())){'\n'}
                  Then type:{'\n'}
                  {'  '}5{'\n'}
                  {'  '}1 2 3 4 5
                </Text>
              </View>
              <TextInput
                style={styles.stdinInput}
                value={customStdin}
                onChangeText={setCustomStdin}
                placeholder={'5\n1 2 3 4 5'}
                placeholderTextColor="#4A5568"
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                scrollEnabled={false}
              />
            </>
          )}
        </View>

        {/* ── Output Panel ──────────────────────────────── */}
        <View style={styles.outputWrap}>
          <View style={styles.outputTopBar}>
            <Text style={styles.outputTopLabel}>OUTPUT</Text>
            {runResult && (
              <View style={[
                styles.outputStatusPill,
                { backgroundColor: runResult.statusId === 3 ? '#16A34A' : '#DC2626' }
              ]}>
                <Text style={styles.outputStatusText}>{runResult.statusDesc}</Text>
              </View>
            )}
            {runResult?.time && (
              <Text style={styles.outputTimeTxt}>{runResult.time}s</Text>
            )}
          </View>

          {runLoading ? (
            <View style={styles.outputRunning}>
              <ActivityIndicator color="#6B6B8A" size="small" />
              <Text style={styles.outputRunningText}>Compiling & running your code...</Text>
            </View>
          ) : runResult ? (
            <View style={styles.outputBody}>
              {runResult.stdout ? (
                <Text style={styles.outputStdout}>{runResult.stdout}</Text>
              ) : (
                <Text style={[styles.outputStdout, { color: '#6B6B8A' }]}>
                  (no output){'\n\n'}
                  <Text style={{ fontSize: 11 }}>
                    💡 If your code calls input(), provide stdin values in the Custom Input section above.
                  </Text>
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.outputEmpty}>
              <Text style={styles.outputEmptyText}>
                Press <Text style={{ fontWeight: '800', color: '#28C840' }}>Run Program</Text> to see output here
              </Text>
            </View>
          )}
        </View>

        {/* ── Action Buttons ────────────────────────────── */}
        <View style={styles.actionRow}>
          {/* Run Program */}
          <TouchableOpacity
            style={[styles.runProgramBtn, runLoading && { opacity: 0.6 }]}
            onPress={handleRunCode}
            disabled={runLoading || loading}
            activeOpacity={0.85}
          >
            {runLoading ? (
              <ActivityIndicator color="#28C840" size="small" />
            ) : (
              <Text style={styles.runProgramIcon}>▶</Text>
            )}
            <Text style={styles.runProgramText}>
              {runLoading ? 'Running...' : 'Run Program'}
            </Text>
          </TouchableOpacity>

          {/* Run & Submit */}
          <TouchableOpacity
            style={[styles.submitCodeBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmitCode}
            disabled={loading || runLoading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Send size={15} color="#FFFFFF" strokeWidth={2.5} />
            )}
            <View>
              <Text style={styles.submitCodeTitle}>
                {loading ? 'Submitting...' : 'Run & Submit'}
              </Text>
              <Text style={styles.submitCodeSub}>
                {loading ? `Checking ${totalTC} test cases` : `${totalTC} hidden cases`}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // ── Quiz: submit all answers ──────────────────────────────────
  const handleSubmitQuiz = async () => {
    if (!quizSession) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const unanswered = quizSession.questions.filter(q =>
      quizAnswers[q.id] === undefined || quizAnswers[q.id].trim() === ''
    );
    if (unanswered.length > 0) {
      Alert.alert(
        'Unanswered Questions',
        `You have ${unanswered.length} unanswered question${unanswered.length > 1 ? 's' : ''}. Please answer all questions before submitting.`,
        [{ text: 'Go to First', onPress: () => setQuizCurrentIdx(unanswered[0].id) }, { text: 'Cancel' }]
      );
      return;
    }
    setLoading(true);
    try {
        const answers = quizSession.questions.map(q => quizAnswers[q.id] ?? '');
      const result = await badgeService.submitQuiz(quizSession.sessionToken, answers) as QuizResult;
      setQuizResult(result);
      setStep('result');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  // ── Step: Quiz ───────────────────────────────────────────────
  const renderQuiz = () => {
    if (!quizSession) return null;
    const { questions, total, passPercent } = quizSession;
    const q = questions[quizCurrentIdx];
    const answeredCount = Object.keys(quizAnswers).length;
    const progressPct = (answeredCount / total) * 100;
    const cfg = LEVEL_CONFIG[selectedLevel as BadgeLevel];
    const options: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const isOutputQ = q.type === 'output';

    return (
      <View style={{ flex: 1 }}>
        {/* Progress + timer bar */}
        <View style={styles.quizProgressWrap}>
          {/* Top row: question count + timer + cheat warnings */}
          <View style={styles.quizProgressRow}>
            <Text style={styles.quizProgressLabel}>
              Q {quizCurrentIdx + 1} / {total}
            </Text>

            {/* Countdown timer */}
            {(() => {
              const pct = timeLeft / totalTimeRef.current;
              const timerColor = pct > 0.5 ? '#16A34A' : pct > 0.25 ? '#F59E0B' : '#DC2626';
              return (
                <View style={[styles.quizTimerBadge, { borderColor: timerColor, backgroundColor: pct <= 0.25 ? '#FEF2F2' : '#F8F8FA' }]}>
                  <Clock size={13} color={timerColor} strokeWidth={2.5} />
                  <Text style={[styles.quizTimerText, { color: timerColor }]}>
                    {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                  </Text>
                </View>
              );
            })()}

            {/* Cheat warning indicators */}
            <View style={styles.quizCheatRow}>
              {Array.from({ length: MAX_CHEAT_WARNINGS }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.quizCheatDot, { backgroundColor: i < cheatWarnings ? '#DC2626' : '#E5E4EA' }]}
                />
              ))}
              {cheatWarnings > 0 && (
                <Text style={styles.quizCheatLabel}>{cheatWarnings}/{MAX_CHEAT_WARNINGS}</Text>
              )}
            </View>
          </View>

          {/* Answer progress bar */}
          <View style={styles.quizProgressBg}>
            <View style={[styles.quizProgressFill, { width: `${progressPct}%` as any, backgroundColor: cfg.color }]} />
          </View>

          {/* Timer bar */}
          {(() => {
            const pct = timeLeft / totalTimeRef.current;
            const timerBarColor = pct > 0.5 ? '#16A34A' : pct > 0.25 ? '#F59E0B' : '#DC2626';
            return (
              <View style={[styles.quizProgressBg, { marginTop: 4 }]}>
                <View style={[styles.quizProgressFill, { width: `${pct * 100}%` as any, backgroundColor: timerBarColor }]} />
              </View>
            );
          })()}

          <Text style={styles.quizPassReq}>
            Pass: {passPercent}% · {selectedLevel} {selectedSkill} Badge · {answeredCount}/{total} answered
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.quizContent} showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Question type badge + question text */}
          <View style={styles.quizQuestionCard}>
            <View style={styles.quizQTypeBadgeRow}>
              <View style={[styles.quizQTypeBadge, { backgroundColor: isOutputQ ? '#171726' : '#EEF2FF' }]}>
                <Text style={[styles.quizQTypeBadgeText, { color: isOutputQ ? '#CDD6F4' : '#4F46E5' }]}>
                  {isOutputQ ? '⌨ Output Prediction' : '◉ Multiple Choice'}
                </Text>
              </View>
              <Text style={styles.quizQuestionNum}>Q{quizCurrentIdx + 1}/{total}</Text>
            </View>
            <Text style={styles.quizQuestionText} selectable={false}>{q.q}</Text>
          </View>

          {isOutputQ ? (
            /* ── Output prediction question ── */
            <>
              {/* Code block */}
              <View style={styles.quizCodeBlock}>
                <View style={styles.quizCodeHeader}>
                  <Text style={styles.quizCodeHeaderText}>{selectedSkill}</Text>
                  <Text style={styles.quizCodeHeaderDots}>● ● ●</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Text style={styles.quizCodeText} selectable={false}>{q.code}</Text>
                </ScrollView>
              </View>

              {/* Output input */}
              <View style={[styles.quizOutputInputWrap, quizAnswers[q.id] !== undefined && {
                borderColor: cfg.color,
              }]}>
                <Text style={styles.quizOutputInputLabel}>Your Answer (type the output):</Text>
                <TextInput
                  style={styles.quizOutputInput}
                  value={quizAnswers[q.id] ?? ''}
                  onChangeText={val => setQuizAnswers(prev => ({ ...prev, [q.id]: val }))}
                  placeholder="Type the exact output here..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="done"
                />
              </View>
            </>
          ) : (
            /* ── MCQ question ── */
            options.map(opt => {
              const isSelected = quizAnswers[q.id] === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.quizOption,
                    isSelected && { borderColor: cfg.color, backgroundColor: cfg.bg },
                  ]}
                  onPress={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                  activeOpacity={0.7}
                >
                  <View style={[styles.quizOptLabel, isSelected && { backgroundColor: cfg.color }]}>
                    <Text style={[styles.quizOptLabelText, isSelected && { color: '#FFFFFF' }]}>{opt}</Text>
                  </View>
                  <Text style={[styles.quizOptText, isSelected && { color: cfg.color, fontWeight: '700' }]}
                    selectable={false}>
                    {q[opt as 'A' | 'B' | 'C' | 'D']}
                  </Text>
                  {isSelected && <CheckCircle2 size={18} color={cfg.color} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            })
          )}

          {/* Navigation */}
          <View style={styles.quizNavRow}>
            <TouchableOpacity
              style={[styles.quizNavBtn, quizCurrentIdx === 0 && { opacity: 0.3 }]}
              onPress={() => setQuizCurrentIdx(i => Math.max(0, i - 1))}
              disabled={quizCurrentIdx === 0}
              activeOpacity={0.7}
            >
              <ChevronLeft size={20} color="#282A32" strokeWidth={2.5} />
              <Text style={styles.quizNavBtnText}>Prev</Text>
            </TouchableOpacity>

            {quizCurrentIdx < total - 1 ? (
              <TouchableOpacity
                style={[styles.quizNavBtn, { flex: 1, justifyContent: 'center', backgroundColor: '#F4F4F8' }]}
                onPress={() => setQuizCurrentIdx(i => Math.min(total - 1, i + 1))}
                activeOpacity={0.7}
              >
                <Text style={styles.quizNavBtnText}>Next</Text>
                <ChevronLeft size={20} color="#282A32" strokeWidth={2.5} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.quizSubmitBtn, { flex: 1, backgroundColor: cfg.color }, loading && { opacity: 0.6 }]}
                onPress={handleSubmitQuiz}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Send size={16} color="#FFFFFF" strokeWidth={2.5} />
                )}
                <Text style={styles.quizSubmitBtnText}>
                  {loading ? 'Submitting...' : 'Submit Quiz'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick jump dots */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quizDotRow}>
            {questions.map((ques, i) => {
              const answered = quizAnswers[i] !== undefined && quizAnswers[i] !== '';
              const isCurrent = i === quizCurrentIdx;
              const isOut = ques.type === 'output';
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.quizDot,
                    isOut && { borderRadius: 6 },
                    answered && { backgroundColor: cfg.color },
                    isCurrent && { borderColor: cfg.color, borderWidth: 2 },
                  ]}
                  onPress={() => setQuizCurrentIdx(i)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quizDotText, answered && { color: '#FFFFFF' }]}>{i + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.quizDotLegend}>
            <View style={[styles.quizDot, { width: 16, height: 16, borderRadius: 4 }]} />
            <Text style={styles.quizDotLegendText}>Output · </Text>
            <View style={[styles.quizDot, { width: 16, height: 16 }]} />
            <Text style={styles.quizDotLegendText}>MCQ · </Text>
            <View style={[styles.quizDot, { width: 16, height: 16, backgroundColor: cfg.color }]} />
            <Text style={styles.quizDotLegendText}>Answered</Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  // ── Step: Certificate ────────────────────────────────────────
  const renderCertificate = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Submit Your Certificate</Text>
      <Text style={styles.pageSubtitle}>
        Skill: <Text style={{ fontWeight: '700', color: '#282A32' }}>{selectedSkill}</Text>
      </Text>

      <Text style={styles.inputLabel}>Certificate Provider</Text>
      <View style={styles.providerGrid}>
        {CERT_PROVIDERS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.providerChip, selectedProvider === p && styles.providerChipActive]}
            onPress={() => setSelectedProvider(p)}
            activeOpacity={0.8}
          >
            <Text style={[styles.providerChipText, selectedProvider === p && styles.providerChipTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.inputLabel}>Certificate URL</Text>
      <TextInput
        style={styles.urlInput}
        value={certUrl}
        onChangeText={setCertUrl}
        placeholder="https://coursera.org/verify/ABC123"
        placeholderTextColor="#C2C2C8"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Admin will review your certificate within 24–48 hours.</Text>
        <Text style={styles.infoText}>Badge appears on your profile once approved.</Text>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitCertificate} disabled={loading} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color="#FFFFFF" /> : (
          <>
            <Send size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.submitBtnText}>Submit for Review</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // ── Step: Codeforces OIDC ─────────────────────────────────────
  const renderCodeforces = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Competitive Programming</Text>
      <Text style={styles.pageSubtitle}>Log in with your Codeforces account — we verify your rating directly via official OAuth.</Text>

      {/* Rating tier info */}
      <View style={styles.cfTierBox}>
        <Text style={styles.cfTierTitle}>Badge Tiers</Text>
        <View style={styles.cfTierRow}>
          <View style={[styles.levelDot, { backgroundColor: '#F59E0B' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cfTierLabel}>Gold Badge</Text>
            <Text style={styles.cfTierDesc}>Rating ≥ 1600 — Expert, Candidate Master, Master, Grandmaster</Text>
          </View>
        </View>
        <View style={styles.cfTierRow}>
          <View style={[styles.levelDot, { backgroundColor: '#94A3B8' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cfTierLabel}>Silver Badge</Text>
            <Text style={styles.cfTierDesc}>Rating ≥ 1200 — Pupil or Specialist</Text>
          </View>
        </View>
        <View style={styles.cfTierRow}>
          <View style={[styles.levelDot, { backgroundColor: '#C2773A' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cfTierLabel}>Bronze Badge</Text>
            <Text style={styles.cfTierDesc}>Any rated user — Newbie with at least 1 rated contest</Text>
          </View>
        </View>
        <Text style={styles.cfNote}>
          Verified via official Codeforces OAuth — no handle entry needed.
        </Text>
      </View>

      {/* How it works */}
      <View style={styles.infoBox}>
        <Text style={[styles.infoText, { fontWeight: '700', color: '#282A32', marginBottom: 4 }]}>How it works</Text>
        <Text style={styles.infoText}>1. Tap "Login with Codeforces" below.</Text>
        <Text style={styles.infoText}>2. Approve access on the Codeforces website.</Text>
        <Text style={styles.infoText}>3. Close the browser — your badge is awarded instantly.</Text>
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleCFLogin} disabled={loading} activeOpacity={0.8}>
        {loading ? (
          <>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Opening Codeforces...</Text>
          </>
        ) : (
          <>
            <Trophy size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.submitBtnText}>Login with Codeforces</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // ── Step: GitHub OAuth ────────────────────────────────────────
  const renderGithub = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>GitHub Developer</Text>
      <Text style={styles.pageSubtitle}>
        Log in with your GitHub account — we score your repos, stars, and activity automatically.
      </Text>

      {/* Score breakdown */}
      <View style={styles.cfTierBox}>
        <Text style={styles.cfTierTitle}>Badge Tiers (auto-scored)</Text>
        <View style={styles.cfTierRow}>
          <View style={[styles.levelDot, { backgroundColor: '#F59E0B' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cfTierLabel}>Gold Badge — score ≥ 110</Text>
            <Text style={styles.cfTierDesc}>Strong open-source presence, many stars & forks</Text>
          </View>
        </View>
        <View style={styles.cfTierRow}>
          <View style={[styles.levelDot, { backgroundColor: '#94A3B8' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cfTierLabel}>Silver Badge — score ≥ 45</Text>
            <Text style={styles.cfTierDesc}>Active developer with several notable projects</Text>
          </View>
        </View>
        <View style={styles.cfTierRow}>
          <View style={[styles.levelDot, { backgroundColor: '#C2773A' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cfTierLabel}>Bronze Badge — score ≥ 15</Text>
            <Text style={styles.cfTierDesc}>Any active developer with public repositories</Text>
          </View>
        </View>
        <Text style={styles.cfNote}>
          Score = stars × 3 + forks × 2 + repos + followers + languages + recent activity bonus
        </Text>
      </View>

      {/* How it works */}
      <View style={styles.infoBox}>
        <Text style={[styles.infoText, { fontWeight: '700', color: '#282A32', marginBottom: 4 }]}>How it works</Text>
        <Text style={styles.infoText}>1. Tap "Login with GitHub" below.</Text>
        <Text style={styles.infoText}>2. Authorize Pak Freelance on the GitHub website.</Text>
        <Text style={styles.infoText}>3. Close the browser — your badge is awarded instantly.</Text>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: '#24292F' }]}
        onPress={handleGithubLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Opening GitHub...</Text>
          </>
        ) : (
          <>
            <Github size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.submitBtnText}>Login with GitHub</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // ── Step: YouTube OAuth ───────────────────────────────────────
  const renderYoutube = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>YouTube Content Creator</Text>
      <Text style={styles.pageSubtitle}>
        Log in with your Google account — we score your channel's subscribers, videos, and views automatically.
      </Text>

      {/* Badge tiers */}
      <View style={styles.cfTierBox}>
        <Text style={styles.cfTierTitle}>Badge Tiers (auto-scored)</Text>
        <View style={styles.cfTierRow}>
          <View style={[styles.levelDot, { backgroundColor: '#F59E0B' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cfTierLabel}>Gold Badge — score ≥ 70</Text>
            <Text style={styles.cfTierDesc}>10 000+ subscribers with solid video & view count</Text>
          </View>
        </View>
        <View style={styles.cfTierRow}>
          <View style={[styles.levelDot, { backgroundColor: '#94A3B8' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cfTierLabel}>Silver Badge — score ≥ 35</Text>
            <Text style={styles.cfTierDesc}>1 000+ subscribers, consistent upload history</Text>
          </View>
        </View>
        <View style={styles.cfTierRow}>
          <View style={[styles.levelDot, { backgroundColor: '#C2773A' }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cfTierLabel}>Bronze Badge — score ≥ 12</Text>
            <Text style={styles.cfTierDesc}>100+ subscribers with at least a few videos</Text>
          </View>
        </View>
        <Text style={styles.cfNote}>
          Score = subscriber tier pts + videos × 0.5 (max 20) + views / 10k (max 20)
        </Text>
      </View>

      {/* How it works */}
      <View style={styles.infoBox}>
        <Text style={[styles.infoText, { fontWeight: '700', color: '#282A32', marginBottom: 4 }]}>How it works</Text>
        <Text style={styles.infoText}>1. Tap "Login with Google" below.</Text>
        <Text style={styles.infoText}>2. Select your Google account and allow YouTube read access.</Text>
        <Text style={styles.infoText}>3. Close the browser — your badge is awarded instantly.</Text>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: '#FF0000' }]}
        onPress={handleYoutubeLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <>
            <ActivityIndicator color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Opening Google...</Text>
          </>
        ) : (
          <>
            <Award size={18} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.submitBtnText}>Login with Google (YouTube)</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // ── Step: Result ─────────────────────────────────────────────
  const renderResult = () => {
    // Portfolio
    if (verifyType === 'creative') {
      return (
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: '#F0FDF4' }]}>
            <Briefcase size={48} color="#16A34A" strokeWidth={1.5} />
          </View>
          <Text style={styles.resultTitle}>Portfolio Verification</Text>
          <Text style={styles.resultSubtitle}>
            Creative skill badges are awarded by admins based on your portfolio quality and client reviews. Keep your portfolio updated.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Got It</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Codeforces OIDC result (user returned from browser)
    if (verifyType === 'competitive' && cfResult !== null) {
      return (
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: '#FEF3C7' }]}>
            <Trophy size={48} color="#F59E0B" strokeWidth={1.5} />
          </View>
          <Text style={[styles.resultTitle, { color: '#F59E0B' }]}>Codeforces Verified!</Text>
          <Text style={styles.resultSubtitle}>
            Your Codeforces account has been verified via official OAuth.{'\n\n'}
            If you are rated, your <Text style={{ fontWeight: '700' }}>Competitive Programming</Text> badge is now on your profile.{'\n\n'}
            If you see no badge, you may be unrated — participate in at least one rated contest first.
          </Text>
          <TouchableOpacity style={[styles.doneBtn, { marginTop: 24 }]} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // YouTube OAuth result (user returned from browser)
    if (verifyType === 'youtube' && youtubeDone) {
      return (
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: '#FFF1F1' }]}>
            <Award size={48} color="#FF0000" strokeWidth={1.5} />
          </View>
          <Text style={[styles.resultTitle, { color: '#FF0000' }]}>YouTube Verified!</Text>
          <Text style={styles.resultSubtitle}>
            Your YouTube channel has been verified via official Google OAuth.{'\n\n'}
            If your channel meets the threshold, your <Text style={{ fontWeight: '700' }}>YouTube Creator</Text> badge is now on your profile.{'\n\n'}
            If no badge appeared, your channel may be below the Bronze threshold — grow your subscriber count and upload more videos!
          </Text>
          <TouchableOpacity style={[styles.doneBtn, { marginTop: 24 }]} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // GitHub OAuth result (user returned from browser)
    if (verifyType === 'github' && githubDone) {
      return (
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: '#F0F0FF' }]}>
            <Github size={48} color="#6E40C9" strokeWidth={1.5} />
          </View>
          <Text style={[styles.resultTitle, { color: '#6E40C9' }]}>GitHub Verified!</Text>
          <Text style={styles.resultSubtitle}>
            Your GitHub account has been verified via official OAuth.{'\n\n'}
            If you have 2+ public repos and enough activity, your <Text style={{ fontWeight: '700' }}>GitHub</Text> badge is now on your profile.{'\n\n'}
            If no badge appeared, your score may be below the Bronze threshold — add more public repos and earn stars!
          </Text>
          <TouchableOpacity style={[styles.doneBtn, { marginTop: 24 }]} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Certificate submitted
    if (certSubmitted) {
      return (
        <View style={styles.resultContainer}>
          <View style={[styles.resultIcon, { backgroundColor: '#EEF2FF' }]}>
            <CheckCircle2 size={48} color="#4F46E5" strokeWidth={1.5} />
          </View>
          <Text style={styles.resultTitle}>Certificate Submitted!</Text>
          <Text style={styles.resultSubtitle}>
            Your <Text style={{ fontWeight: '700' }}>{selectedSkill}</Text> certificate is under review.
            You'll see the badge on your profile once approved (24–48 hrs).
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Quiz disqualified (cheat detected)
    if (quizDisqualified) {
      return (
        <ScrollView contentContainerStyle={[styles.content, { alignItems: 'center', paddingTop: 40 }]}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.resultIcon, { backgroundColor: '#FEF2F2', marginBottom: 16 }]}>
            <XCircle size={52} color="#DC2626" strokeWidth={1.5} />
          </View>
          <Text style={[styles.resultTitle, { color: '#DC2626' }]}>Quiz Disqualified</Text>
          <Text style={styles.resultSubtitle}>
            You switched apps {MAX_CHEAT_WARNINGS} times during the quiz.{'\n\n'}
            Using AI tools (ChatGPT, GitHub Copilot, Gemini, Bing AI) or any browser AI assistant is strictly not allowed. The badge system is used by clients to judge your real skills.
          </Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: '#FEF2F2', marginBottom: 12 }]}
            onPress={() => {
              setQuizDisqualified(false);
              cheatCountRef.current = 0;
              setCheatWarnings(0);
              setStep('choose_skill_level');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.doneBtnText, { color: '#DC2626' }]}>Try Again (Honestly)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Back to Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    // Quiz result
    if (quizResult) {
      const { score, passed, correct, total, badge } = quizResult;
      const badgeLevel = badge?.badgeLevel;
      const levelColors: Record<string, string> = { Gold: '#F59E0B', Silver: '#94A3B8', Bronze: '#C2773A' };
      const levelBg: Record<string, string>     = { Gold: '#FEF3C7', Silver: '#F1F5F9', Bronze: '#FEF2E8' };
      const color = badgeLevel ? levelColors[badgeLevel] : '#C2C2C8';
      const bg    = badgeLevel ? levelBg[badgeLevel]     : '#F4F4F8';
      return (
        <ScrollView contentContainerStyle={[styles.content, { alignItems: 'center', paddingTop: 32 }]}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.resultIcon, { backgroundColor: bg, marginBottom: 12 }]}>
            <Award size={48} color={color} strokeWidth={1.5} />
          </View>
          <Text style={styles.scoreText}>{score}%</Text>
          <Text style={[styles.resultTitle, { color: passed ? color : '#C2C2C8' }]}>
            {passed ? `${badgeLevel} Badge Earned!` : 'Score Too Low'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {passed
              ? `You answered ${correct}/${total} correctly. The ${badgeLevel} ${selectedSkill} badge is now on your profile.`
              : `You answered ${correct}/${total} correctly. Need 70%+ to earn a ${selectedLevel} badge.`}
          </Text>
          {!passed && (
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: '#EEF2FF', marginBottom: 12 }]}
              onPress={() => {
                setQuizResult(null);
                setQuizAnswers({});
                setQuizCurrentIdx(0);
                setStep('choose_skill_level');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.doneBtnText, { color: '#4F46E5' }]}>Try Again</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Back to Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    // Coding test result
    if (!submitResult) return null;

    const { score, passed, testResults, passedCount, totalCount, compilationError, badge } = submitResult;
    const badgeLevel = badge?.badgeLevel;
    const levelColors: Record<string, string> = { Gold: '#F59E0B', Silver: '#94A3B8', Bronze: '#C2773A' };
    const levelBg: Record<string, string>     = { Gold: '#FEF3C7', Silver: '#F1F5F9', Bronze: '#FEF2E8' };
    const color = badgeLevel ? levelColors[badgeLevel] : '#C2C2C8';
    const bg    = badgeLevel ? levelBg[badgeLevel]     : '#F4F4F8';

    return (
      <ScrollView contentContainerStyle={[styles.content, { alignItems: 'center', paddingTop: 32 }]}
        showsVerticalScrollIndicator={false}>
        {/* Score circle */}
        <View style={[styles.resultIcon, { backgroundColor: bg, marginBottom: 12 }]}>
          <Award size={48} color={color} strokeWidth={1.5} />
        </View>
        <Text style={styles.scoreText}>{score} / 100</Text>

        {compilationError ? (
          <>
            <Text style={[styles.resultTitle, { color: '#DC2626' }]}>Compilation Error</Text>
            <View style={styles.compileErrorBox}>
              <Text style={styles.compileErrorText}>{compilationError}</Text>
            </View>
          </>
        ) : passed && badgeLevel ? (
          <Text style={[styles.resultTitle, { color }]}>{badgeLevel} Badge Earned!</Text>
        ) : (
          <Text style={[styles.resultTitle, { color: '#C2C2C8' }]}>Score Too Low</Text>
        )}

        <Text style={styles.resultSubtitle}>
          {compilationError
            ? 'Fix your code and try again.'
            : passed
            ? `You passed ${passedCount}/${totalCount} test cases. The ${badgeLevel} badge is now on your profile.`
            : `You passed ${passedCount}/${totalCount} test cases. Need 3+ to earn a badge.`}
        </Text>

        {/* Per-test-case breakdown */}
        {testResults && testResults.length > 0 && (
          <View style={styles.testBreakdown}>
            <Text style={styles.breakdownTitle}>Test Case Results</Text>
            {/* Mini bubble row */}
            <View style={styles.tcBubblesResult}>
              {testResults.map((tc) => (
                <View
                  key={tc.case}
                  style={[
                    styles.tcBubbleResult,
                    { backgroundColor: tc.passed ? '#16A34A' : '#DC2626' },
                  ]}
                >
                  <Text style={styles.tcBubbleResultText}>{tc.case}</Text>
                </View>
              ))}
            </View>
            {testResults.map((tc) => (
              <View key={tc.case} style={[styles.tcRow, { backgroundColor: tc.passed ? '#F0FDF4' : '#FEF2F2' }]}>
                <View style={styles.tcLeft}>
                  {tc.passed
                    ? <CheckCircle2 size={18} color="#16A34A" strokeWidth={2.5} />
                    : <XCircle size={18} color="#DC2626" strokeWidth={2.5} />}
                  <Text style={[styles.tcLabel, { color: tc.passed ? '#16A34A' : '#DC2626' }]}>
                    Case {tc.case}
                  </Text>
                </View>
                <View style={styles.tcRight}>
                  {tc.passed && (
                    <View style={styles.tcTime}>
                      <Clock size={12} color="#16A34A" strokeWidth={2} />
                      <Text style={[styles.tcTimeText, { color: '#16A34A' }]}>{tc.time.toFixed(2)}s</Text>
                    </View>
                  )}
                  <Text style={[styles.tcStatus, { color: tc.passed ? '#16A34A' : '#DC2626', fontWeight: '700' }]}>
                    {tc.passed ? 'Accepted' : tc.statusDesc}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={[styles.doneBtn, { marginTop: 24 }]} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.doneBtnText}>Back to Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <ChevronLeft size={22} color="#282A32" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verify Skill</Text>
          <View style={{ width: 42 }} />
        </View>

        {step === 'choose_type'       && renderChooseType()}
        {step === 'choose_skill_level'&& renderChooseSkillLevel()}
        {step === 'choose_skill'      && renderChooseSkill()}
        {step === 'coding_test'       && renderCodingTest()}
        {step === 'quiz'              && renderQuiz()}
        {step === 'certificate'  && renderCertificate()}
        {step === 'codeforces'   && renderCodeforces()}
        {step === 'github'       && renderGithub()}
        {step === 'youtube'      && renderYoutube()}
        {step === 'result'       && renderResult()}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F8' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E4EA',
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#F4F4F8', justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#282A32', letterSpacing: -0.3 },
  content: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#282A32', marginBottom: 6, letterSpacing: -0.4 },
  pageSubtitle: { fontSize: 14, color: '#C2C2C8', fontWeight: '500', marginBottom: 24, lineHeight: 20 },

  // Type cards
  typeCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E4EA',
  },
  typeIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  typeInfo: { flex: 1 },
  typeTitle: { fontSize: 15, fontWeight: '700', color: '#282A32', marginBottom: 4 },
  typeDesc: { fontSize: 13, color: '#C2C2C8', fontWeight: '500', lineHeight: 18 },

  // Difficulty legend
  diffLegend: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  diffDot: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  diffDotText: { fontSize: 12, fontWeight: '700' },

  // Skill rows
  skillRow: {
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14,
    marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderWidth: 1, borderColor: '#E5E4EA',
  },
  skillRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  skillRowText: { fontSize: 15, fontWeight: '700', color: '#282A32' },
  diffBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  diffBadgeText: { fontSize: 11, fontWeight: '700' },

  // ── IDE Header ───────────────────────────────────────────────
  ideHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1E1E2E', paddingHorizontal: 16, paddingVertical: 12,
  },
  ideHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  ideHeaderCenter: { flex: 1, alignItems: 'center' },
  ideFileName: { fontSize: 13, color: '#A0A0B0', fontFamily: 'monospace', fontWeight: '600' },
  diffBadgeDark: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  diffBadgeDarkText: { fontSize: 11, fontWeight: '800' },

  // ── Problem Panel ────────────────────────────────────────────
  problemPanel: {
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E4EA',
    padding: 18,
  },
  problemTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10, gap: 10 },
  problemTitle: { fontSize: 18, fontWeight: '900', color: '#282A32', letterSpacing: -0.5, flex: 1 },
  langTag: { backgroundColor: '#282A32', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  langTagText: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
  problemDesc: { fontSize: 14, color: '#444751', lineHeight: 23, fontWeight: '500', marginBottom: 16 },
  panelDivider: { height: 1, backgroundColor: '#F4F4F8', marginBottom: 16 },

  // IO boxes
  ioRow: { flexDirection: 'row', marginBottom: 16 },
  ioBox: { flex: 1, paddingRight: 14 },
  ioLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  ioAccent: { width: 3, height: 14, borderRadius: 2 },
  ioLabel: { fontSize: 11, fontWeight: '800', color: '#282A32', letterSpacing: 0.5 },
  ioText: { fontSize: 12, color: '#444751', lineHeight: 19, fontWeight: '500' },

  // Example dark terminal style
  exampleHeading: { fontSize: 12, fontWeight: '800', color: '#282A32', marginBottom: 10, letterSpacing: 0.4 },
  exampleDark: {
    backgroundColor: '#1A1A2E', borderRadius: 12, flexDirection: 'row',
    overflow: 'hidden',
  },
  exampleDarkHalf: { flex: 1, padding: 12 },
  exampleDarkDivider: { width: 1, backgroundColor: '#2D2D44' },
  exampleDarkLabel: { fontSize: 10, color: '#6B6B8A', fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 },
  exampleDarkCode: { fontSize: 13, color: '#A9FFC4', fontFamily: 'monospace', lineHeight: 20 },

  // ── Test Case Bubbles ────────────────────────────────────────
  tcProgressBox: {
    backgroundColor: '#FFFFFF', padding: 18,
    borderBottomWidth: 1, borderBottomColor: '#E5E4EA',
  },
  tcProgressHeader: { marginBottom: 14 },
  tcProgressTitle: { fontSize: 14, fontWeight: '800', color: '#282A32', marginBottom: 2 },
  tcProgressSub: { fontSize: 12, color: '#C2C2C8', fontWeight: '500' },
  tcBubbles: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tcBubble: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#282A32', justifyContent: 'center', alignItems: 'center',
  },
  tcBubbleText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  thresholdRow: { flexDirection: 'row', gap: 12 },
  thresholdItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  thresholdDot: { width: 8, height: 8, borderRadius: 4 },
  thresholdText: { fontSize: 11, color: '#444751', fontWeight: '500' },

  // ── Dark Code Editor ─────────────────────────────────────────
  editorWrap: { backgroundColor: '#1E1E2E', marginTop: 2 },
  editorTopBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#2D2D44',
  },
  editorTopLabel: { fontSize: 10, color: '#6B6B8A', fontWeight: '800', letterSpacing: 1 },
  editorTopHint: { fontSize: 11, color: '#6B6B8A', fontWeight: '500' },
  editorBody: { flexDirection: 'row', minHeight: 220 },
  lineNumbers: {
    backgroundColor: '#171726', paddingTop: 14, paddingHorizontal: 10,
    alignItems: 'flex-end', minWidth: 36,
  },
  lineNum: { fontSize: 12, color: '#3D3D5C', fontFamily: 'monospace', lineHeight: 20 },
  codeInputDark: {
    flex: 1, padding: 14, paddingLeft: 12,
    fontSize: 13, color: '#CDD6F4', fontFamily: 'monospace',
    textAlignVertical: 'top', lineHeight: 20,
  },

  // ── Stdin ─────────────────────────────────────────────────────
  stdinWrap: { backgroundColor: '#171726', borderTopWidth: 1, borderTopColor: '#2D2D44' },
  stdinToggle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  stdinToggleLabel: { fontSize: 11, color: '#6B6B8A', fontWeight: '700', letterSpacing: 0.5 },
  stdinToggleHint: { fontSize: 10, color: '#3D3D5C', fontWeight: '500' },
  stdinHintBox: {
    backgroundColor: '#1A1A2E', borderTopWidth: 1, borderTopColor: '#2D2D44',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  stdinHintText: { fontSize: 11, color: '#6B6B8A', lineHeight: 17, marginBottom: 6 },
  stdinHintExample: {
    fontSize: 11, color: '#4A5568', fontFamily: 'monospace', lineHeight: 17,
    backgroundColor: '#0F0F1A', padding: 8, borderRadius: 6,
  },
  stdinInput: {
    backgroundColor: '#0F0F1A', color: '#CDD6F4', fontFamily: 'monospace',
    fontSize: 13, padding: 12, minHeight: 72, textAlignVertical: 'top',
    borderTopWidth: 1, borderTopColor: '#2D2D44',
  },

  // ── Output Panel ──────────────────────────────────────────────
  outputWrap: { backgroundColor: '#0F0F1A', minHeight: 130 },
  outputTopBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: '#2D2D44',
    backgroundColor: '#171726',
  },
  outputTopLabel: { fontSize: 10, color: '#6B6B8A', fontWeight: '800', letterSpacing: 1, flex: 1 },
  outputStatusPill: {
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
  },
  outputStatusText: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
  outputTimeTxt: { fontSize: 10, color: '#6B6B8A', fontWeight: '600' },
  outputRunning: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 16,
  },
  outputRunningText: { fontSize: 12, color: '#6B6B8A', fontStyle: 'italic' },
  outputBody: { padding: 14 },
  outputStdout: {
    fontFamily: 'monospace', fontSize: 13, color: '#A6E3A1', lineHeight: 20,
  },
  outputErrLabel: { fontSize: 10, color: '#F38BA8', fontWeight: '800', letterSpacing: 0.5, marginBottom: 6, marginTop: 4 },
  outputErrText: { fontFamily: 'monospace', fontSize: 12, color: '#F38BA8', lineHeight: 18 },
  outputEmpty: { padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 100 },
  outputEmptyText: { fontSize: 12, color: '#3D3D5C', textAlign: 'center', lineHeight: 20 },

  // ── Action Row ────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#1E1E2E',
    borderTopWidth: 1, borderTopColor: '#2D2D44',
  },
  runProgramBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: '#1A2E1A', borderWidth: 1.5, borderColor: '#28C840',
    borderRadius: 12, paddingVertical: 13,
  },
  runProgramIcon: { fontSize: 14, color: '#28C840' },
  runProgramText: { fontSize: 14, fontWeight: '800', color: '#28C840' },
  submitCodeBtn: {
    flex: 1.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#F0C040', borderRadius: 12, paddingVertical: 13,
  },
  submitCodeTitle: { fontSize: 13, fontWeight: '800', color: '#282A32' },
  submitCodeSub: { fontSize: 10, color: '#7A6300', fontWeight: '500' },

  // ── Dropdown (choose_skill_level step) ───────────────────────
  dropLabel: {
    fontSize: 11, fontWeight: '800', color: '#94A3B8',
    letterSpacing: 1, marginBottom: 8,
  },
  dropBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E5E4EA',
    paddingHorizontal: 16, paddingVertical: 15,
  },
  dropBtnValue: { fontSize: 15, fontWeight: '700', color: '#282A32', flex: 1 },
  dropBtnPlaceholder: { fontSize: 14, color: '#C2C2C8', flex: 1 },
  selectedLevelCard: {
    borderWidth: 2, borderRadius: 16, padding: 16, marginTop: 20,
  },
  selectedLevelTitle: { fontSize: 16, fontWeight: '900', marginBottom: 4 },
  selectedLevelDesc: { fontSize: 13, color: '#444751', fontWeight: '500', marginBottom: 3 },
  selectedLevelReq: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  startTestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#F0C040', borderRadius: 16,
    paddingVertical: 17, marginTop: 28,
  },
  startTestBtnText: { fontSize: 16, fontWeight: '900', color: '#282A32', letterSpacing: -0.3 },
  // ── Modal Sheet ───────────────────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 34, maxHeight: '75%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E4EA',
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  modalTitle: {
    fontSize: 17, fontWeight: '900', color: '#282A32',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F4F4F8',
  },
  modalOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F8F8FA',
  },
  modalOptionActive: { backgroundColor: '#F5F3FF' },
  modalOptionText: { fontSize: 15, fontWeight: '700', color: '#282A32', marginBottom: 2 },
  modalOptionSub: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },

  // ── Level Card (choose_level step) ───────────────────────────
  levelCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 2, borderRadius: 18, padding: 18, marginBottom: 12,
  },
  levelCardIcon: { fontSize: 32 },
  levelCardInfo: { flex: 1 },
  levelCardTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3, marginBottom: 2 },
  levelCardDesc: { fontSize: 13, color: '#444751', fontWeight: '500', marginBottom: 3 },
  levelCardReq: { fontSize: 11, color: '#C2C2C8', fontWeight: '600' },
  earnedPill: {
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
  },
  earnedPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

  // Keep levelDot for cfTierRow usage
  levelDot: { width: 10, height: 10, borderRadius: 5 },

  // Code input (cert/other uses, keep for compatibility)
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#444751', marginBottom: 8 },
  codeInput: {
    backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E4EA',
    padding: 16, fontSize: 13, color: '#282A32', fontFamily: 'monospace',
    minHeight: 200, textAlignVertical: 'top', marginBottom: 16,
  },

  // Certificate
  providerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  providerChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E4EA', backgroundColor: '#FFFFFF',
  },
  providerChipActive: { borderColor: '#444751', backgroundColor: '#444751' },
  providerChipText: { fontSize: 13, color: '#444751', fontWeight: '600' },
  providerChipTextActive: { color: '#FFFFFF' },
  urlInput: {
    backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E4EA',
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#282A32',
    fontWeight: '500', marginBottom: 16,
  },
  infoBox: { backgroundColor: '#F4F4F8', borderRadius: 12, padding: 14, marginBottom: 24, gap: 4 },
  infoText: { fontSize: 12, color: '#444751', fontWeight: '500' },

  // Submit button
  submitBtn: {
    backgroundColor: '#282A32', borderRadius: 16, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

  // Result
  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultIcon: {
    width: 100, height: 100, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  scoreText: { fontSize: 36, fontWeight: '900', color: '#282A32', letterSpacing: -1, marginBottom: 8 },
  resultTitle: { fontSize: 22, fontWeight: '800', color: '#282A32', textAlign: 'center', marginBottom: 10, letterSpacing: -0.4 },
  resultSubtitle: { fontSize: 14, color: '#C2C2C8', fontWeight: '500', textAlign: 'center', lineHeight: 22, marginBottom: 8 },

  // Compilation error
  compileErrorBox: {
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#FECACA', marginVertical: 12, width: '100%',
  },
  compileErrorText: { fontSize: 12, color: '#DC2626', fontFamily: 'monospace', lineHeight: 18 },

  // Test case breakdown
  testBreakdown: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#E5E4EA', marginTop: 16, gap: 6,
  },
  breakdownTitle: { fontSize: 14, fontWeight: '800', color: '#282A32', marginBottom: 8 },
  tcBubblesResult: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  tcBubbleResult: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  tcBubbleResultText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  tcRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10,
  },
  tcLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tcLabel: { fontSize: 14, fontWeight: '700' },
  tcRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tcTime: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tcTimeText: { fontSize: 12, fontWeight: '600' },
  tcStatus: { fontSize: 12, fontWeight: '600' },

  doneBtn: {
    backgroundColor: '#282A32', borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 40,
  },
  doneBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  // Codeforces step
  cfTierBox: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: '#E5E4EA', gap: 12,
  },
  cfTierTitle: { fontSize: 13, fontWeight: '800', color: '#282A32', marginBottom: 4 },
  cfTierRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cfTierLabel: { fontSize: 13, fontWeight: '700', color: '#282A32', marginBottom: 2 },
  cfTierDesc: { fontSize: 12, color: '#C2C2C8', fontWeight: '500', lineHeight: 17 },
  cfNote: { fontSize: 11, color: '#C2C2C8', fontWeight: '500', lineHeight: 16, marginTop: 4, fontStyle: 'italic' },

  // ── GitHub styles ─────────────────────────────────────────────
  ghTierDivider: { height: 1, backgroundColor: '#E5E4EA', marginVertical: 10 },
  ghStatsRow: {
    flexDirection: 'row', gap: 10, marginBottom: 20, width: '100%',
  },
  ghStatBox: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12,
    alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#E5E4EA',
  },
  ghStatVal: { fontSize: 16, fontWeight: '800', color: '#282A32' },
  ghStatLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },
  ghScoreWrap: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E5E4EA', marginBottom: 16,
  },
  ghScoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ghScoreLabel: { fontSize: 13, fontWeight: '700', color: '#282A32' },
  ghScoreVal: { fontSize: 13, fontWeight: '800' },
  ghScoreTrack: {
    height: 10, backgroundColor: '#F0F0F8', borderRadius: 5, overflow: 'hidden', marginBottom: 6,
  },
  ghScoreFill: { height: 10, borderRadius: 5 },
  ghScoreTicks: { flexDirection: 'row', justifyContent: 'space-between' },
  ghScoreTick: { fontSize: 9, color: '#C2C2C8', fontWeight: '600' },
  ghLangWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16, justifyContent: 'center' },
  ghLangPill: {
    backgroundColor: '#F0F0FF', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#D4D0F5',
  },
  ghLangText: { fontSize: 11, fontWeight: '700', color: '#6E40C9' },

  // Codeforces result
  cfRankText: { fontSize: 16, fontWeight: '700', marginBottom: 6, textTransform: 'capitalize' },

  // ── Quiz styles ───────────────────────────────────────────────
  quizProgressWrap: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#E5E4EA',
  },
  quizProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  quizProgressLabel: { fontSize: 13, fontWeight: '700', color: '#282A32' },
  quizProgressBg: { height: 6, backgroundColor: '#E5E4EA', borderRadius: 3, overflow: 'hidden' },
  quizProgressFill: { height: 6, borderRadius: 3 },
  quizPassReq: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 6 },

  // Timer badge
  quizTimerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  quizTimerText: { fontSize: 13, fontWeight: '800', fontFamily: 'monospace', letterSpacing: 0.5 },

  // Cheat warning dots
  quizCheatRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quizCheatDot: { width: 8, height: 8, borderRadius: 4 },
  quizCheatLabel: { fontSize: 10, fontWeight: '800', color: '#DC2626', marginLeft: 2 },

  quizContent: { padding: 20, paddingBottom: 40 },

  quizQuestionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: '#E5E4EA',
  },
  quizQuestionNum: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 8, letterSpacing: 0.5 },
  quizQuestionText: { fontSize: 16, fontWeight: '600', color: '#282A32', lineHeight: 24 },

  quizOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 2, borderColor: '#E5E4EA',
  },
  quizOptLabel: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: '#F4F4F8',
    justifyContent: 'center', alignItems: 'center',
  },
  quizOptLabelText: { fontSize: 14, fontWeight: '800', color: '#282A32' },
  quizOptText: { flex: 1, fontSize: 14, color: '#282A32', fontWeight: '500', lineHeight: 20 },

  quizNavRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 12 },
  quizNavBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
    borderWidth: 1, borderColor: '#E5E4EA',
  },
  quizNavBtnText: { fontSize: 14, fontWeight: '700', color: '#282A32' },

  quizSubmitBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
  },
  quizSubmitBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },

  quizDotRow: { marginTop: 20 },
  quizDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E4EA',
    justifyContent: 'center', alignItems: 'center', marginRight: 6, borderWidth: 1, borderColor: 'transparent',
  },
  quizDotText: { fontSize: 11, fontWeight: '700', color: '#282A32' },
  quizDotLegend: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingLeft: 2,
  },
  quizDotLegendText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

  // Question type badge
  quizQTypeBadgeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  quizQTypeBadge: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  quizQTypeBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },

  // Code block for output questions
  quizCodeBlock: {
    backgroundColor: '#13131F', borderRadius: 14, marginBottom: 14,
    borderWidth: 1, borderColor: '#2D2D44', overflow: 'hidden',
  },
  quizCodeHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#1E1E2E',
    borderBottomWidth: 1, borderBottomColor: '#2D2D44',
  },
  quizCodeHeaderText: { fontSize: 11, fontWeight: '700', color: '#6B6B8A', letterSpacing: 0.5 },
  quizCodeHeaderDots: { fontSize: 10, color: '#3D3D5C', letterSpacing: 3 },
  quizCodeText: {
    fontFamily: 'monospace', fontSize: 13, color: '#CDD6F4', lineHeight: 22,
    padding: 14,
  },

  // Output answer input
  quizOutputInputWrap: {
    backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 2,
    borderColor: '#E5E4EA', marginBottom: 14, overflow: 'hidden',
  },
  quizOutputInputLabel: {
    fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6,
  },
  quizOutputInput: {
    fontFamily: 'monospace', fontSize: 14, color: '#282A32',
    paddingHorizontal: 14, paddingBottom: 14, minHeight: 52,
    textAlignVertical: 'top',
  },
});
