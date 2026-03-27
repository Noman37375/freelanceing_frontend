import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft, ChevronDown, ChevronUp, CheckCircle, Calendar,
  ChevronLeft as ChevLeft, ChevronRight, Send, Award, Clock, XCircle, ShieldAlert,
} from "lucide-react-native";
import { projectService, proposalService } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { Project } from "@/models/Project";
import { formatCurrency } from "@/utils/helpers";
import { MapPin, DollarSign } from "lucide-react-native";

// ─── helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (timestamp?: string) => {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `Posted ${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `Posted ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

interface QuizQuestion {
  id: number;
  q: string;
  A: string;
  B: string;
  C: string;
  D: string;
}

interface QuizSession {
  sessionToken: string;
  questions: QuizQuestion[];
  total: number;
  projectTitle: string;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BidNow() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  // ── Project + form state ──────────────────────────────────────────────────
  const [project, setProject]               = useState<Project | null>(null);
  const [loading, setLoading]               = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [showSuccessModal, setShowSuccess]  = useState(false);
  const [showDetails, setShowDetails]       = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [bidAmount, setBidAmount]           = useState<string>("");
  const [coverLetter, setCoverLetter]       = useState<string>("");

  // ── Step: 'form' | 'quiz' | 'blocked' ────────────────────────────────────
  const [step, setStep] = useState<'form' | 'quiz' | 'blocked'>('form');

  // ── Quiz state ────────────────────────────────────────────────────────────
  const [quizSession, setQuizSession]       = useState<QuizSession | null>(null);
  const [quizAnswers, setQuizAnswers]       = useState<Record<number, string>>({});
  const [quizCurrentIdx, setQuizCurrentIdx] = useState(0);
  const [quizLoading, setQuizLoading]       = useState(false);
  const [quizResult, setQuizResult]         = useState<{ score: number; correct: number; total: number } | null>(null);
  const quizStartedAt = useRef<number>(0);

  // ── Block / fail state ────────────────────────────────────────────────────
  type BlockInfo = { permanentlyBlocked: boolean; attemptNumber?: number; retryAfter?: string | null; badgeUnblockAvailable?: boolean };
  type FailInfo  = { score: number; correct: number; total: number; threshold: number; attemptNumber: number; retryAfter: string | null; permanentlyBlocked: boolean };
  const [blockInfo, setBlockInfo]     = useState<BlockInfo | null>(null);
  const [failInfo, setFailInfo]       = useState<FailInfo | null>(null);
  const [showFailModal, setShowFailModal] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState('');

  // Live countdown for retry timer (block screen + fail modal)
  useEffect(() => {
    const retryAt = blockInfo?.retryAfter || failInfo?.retryAfter;
    if (!retryAt) { setRetryCountdown(''); return; }
    const tick = () => {
      const remaining = new Date(retryAt).getTime() - Date.now();
      if (remaining <= 0) { setRetryCountdown('Ready to retry'); return; }
      const h = Math.floor(remaining / 3_600_000);
      const m = Math.floor((remaining % 3_600_000) / 60_000);
      const s = Math.floor((remaining % 60_000) / 1000);
      setRetryCountdown(h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [blockInfo?.retryAfter, failInfo?.retryAfter]);

  // Fetch project
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await projectService.getProjectById(id);
        setProject(data || null);
        if (data?.budget && data.budget > 0) setBidAmount(String(data.budget));
      } catch (err: any) {
        Alert.alert("Error", err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ── Validate form + start quiz ─────────────────────────────────────────────

  const handleContinueToQuiz = async () => {
    setSubmitAttempted(true);
    if (!id) return Alert.alert("Error", "Missing project ID");
    if (!user || user.role !== "Freelancer")
      return Alert.alert("Error", "Only freelancers can submit proposals");

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0)
      return Alert.alert("Validation Error", "Please enter a valid bid amount");
    if (!coverLetter.trim())
      return Alert.alert("Validation Error", "Please write a cover letter");

    try {
      setQuizLoading(true);
      const result = await proposalService.startProposalQuiz(id);
      if (result.blocked) {
        setBlockInfo(result);
        setStep('blocked');
        return;
      }
      setQuizSession(result);
      setQuizAnswers({});
      setQuizCurrentIdx(0);
      quizStartedAt.current = Date.now();
      setStep('quiz');
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to load quiz");
    } finally {
      setQuizLoading(false);
    }
  };

  // ── Submit quiz + proposal ─────────────────────────────────────────────────

  const handleSubmitProposal = async () => {
    if (!quizSession || !id) return;

    const answersArray = quizSession.questions.map(q => quizAnswers[q.id] || '');
    const unanswered = answersArray.filter(a => !a).length;
    if (unanswered > 0) {
      Alert.alert(
        "Unanswered Questions",
        `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Are you sure you want to submit?`,
        [
          { text: "Go Back", style: "cancel" },
          { text: "Submit Anyway", onPress: () => doSubmit(answersArray) },
        ]
      );
      return;
    }
    doSubmit(answersArray);
  };

  const doSubmit = async (answersArray: string[]) => {
    if (!quizSession || !id) return;
    try {
      setSubmitting(true);
      const result = await proposalService.createProposalWithQuiz(id, {
        coverLetter: coverLetter.trim(),
        bidAmount: parseFloat(bidAmount),
        sessionToken: quizSession.sessionToken,
        answers: answersArray,
      });
      if (!result.passed) {
        setFailInfo(result);
        setShowFailModal(true);
      } else {
        setQuizResult(result.quizResult);
        setShowSuccess(true);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Unable to submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading screen ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#444751" />
      </View>
    );
  }

  // ── Blocked screen ────────────────────────────────────────────────────────

  if (step === 'blocked' && blockInfo) {
    const isPermanent = blockInfo.permanentlyBlocked;
    const canRetry    = !isPermanent && retryCountdown === 'Ready to retry';

    return (
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#282A32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Application Blocked</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { alignItems: 'center', paddingTop: 40 }]}>
          <View style={[styles.blockIconWrap, { backgroundColor: isPermanent ? '#FEF2F2' : '#FFFBEB' }]}>
            {isPermanent
              ? <ShieldAlert size={48} color="#EF4444" strokeWidth={1.5} />
              : <Clock size={48} color="#F59E0B" strokeWidth={1.5} />}
          </View>

          <Text style={styles.blockTitle}>
            {isPermanent ? 'Permanently Blocked' : 'Quiz on Cooldown'}
          </Text>

          {isPermanent ? (
            <>
              <Text style={styles.blockMsg}>
                You have used all 3 quiz attempts for this project. You can no longer apply here.
              </Text>
              <View style={styles.blockBadgeTip}>
                <Award size={16} color="#4F46E5" strokeWidth={2} />
                <Text style={styles.blockBadgeTipText}>
                  Earn a verified skill badge from your profile to unlock one final attempt on this project.
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.blockMsg}>
                You failed attempt {blockInfo.attemptNumber} of 3. Please wait before trying again.
              </Text>
              <View style={styles.blockCountdownBox}>
                <Clock size={18} color={canRetry ? '#10B981' : '#F59E0B'} strokeWidth={2} />
                <Text style={[styles.blockCountdownText, { color: canRetry ? '#10B981' : '#F59E0B' }]}>
                  {retryCountdown || 'Calculating…'}
                </Text>
              </View>
              {blockInfo.attemptNumber === 2 && (
                <View style={styles.blockWarning}>
                  <Text style={styles.blockWarningText}>
                    ⚠️  This is your last attempt. Failing again will permanently block you from this project.
                  </Text>
                </View>
              )}
            </>
          )}

          {!isPermanent && canRetry && (
            <TouchableOpacity
              style={styles.blockRetryBtn}
              onPress={() => { setBlockInfo(null); setStep('form'); }}
              activeOpacity={0.85}
            >
              <Text style={styles.blockRetryBtnText}>Try Again Now</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.blockBackBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.blockBackBtnText}>Back to Project</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Quiz loading overlay ───────────────────────────────────────────────────

  if (quizLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.quizLoadingText}>Generating quiz from job description…</Text>
        <Text style={styles.quizLoadingSubtext}>This may take a few seconds</Text>
      </View>
    );
  }

  // ── Quiz step ─────────────────────────────────────────────────────────────

  if (step === 'quiz' && quizSession) {
    const { questions, total } = quizSession;
    const q = questions[quizCurrentIdx];
    const opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const answeredCount = Object.values(quizAnswers).filter(a => a).length;

    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.wrapper}>
        {/* Quiz header */}
        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={() => setStep('form')} style={styles.backButton}>
            <ArrowLeft size={22} color="#282A32" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.quizHeaderTitle}>Screening Quiz</Text>
            <Text style={styles.quizHeaderSub}>Answer to complete your application</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress bar */}
        <View style={styles.quizProgressWrap}>
          <View style={styles.quizProgressBg}>
            <View style={[styles.quizProgressFill, { width: `${(answeredCount / total) * 100}%` as any }]} />
          </View>
          <Text style={styles.quizProgressLabel}>{answeredCount}/{total} answered</Text>
        </View>

        <ScrollView contentContainerStyle={styles.quizContent} showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Question card */}
          <View style={styles.quizCard}>
            <View style={styles.quizQNumRow}>
              <View style={styles.quizQNumBadge}>
                <Text style={styles.quizQNumText}>Q{quizCurrentIdx + 1}</Text>
              </View>
              <Text style={styles.quizQTotal}>of {total}</Text>
            </View>
            <Text style={styles.quizQuestionText}>{q.q}</Text>
          </View>

          {/* Options */}
          {opts.map(opt => {
            const isSelected = quizAnswers[q.id] === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.quizOption, isSelected && styles.quizOptionSelected]}
                onPress={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                activeOpacity={0.7}
              >
                <View style={[styles.quizOptLabel, isSelected && styles.quizOptLabelSelected]}>
                  <Text style={[styles.quizOptLabelText, isSelected && { color: '#FFF' }]}>{opt}</Text>
                </View>
                <Text style={[styles.quizOptText, isSelected && styles.quizOptTextSelected]}>
                  {q[opt]}
                </Text>
                {isSelected && <CheckCircle size={18} color="#4F46E5" strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}

          {/* Navigation */}
          <View style={styles.quizNavRow}>
            <TouchableOpacity
              style={[styles.quizNavBtn, quizCurrentIdx === 0 && { opacity: 0.3 }]}
              onPress={() => setQuizCurrentIdx(i => Math.max(0, i - 1))}
              disabled={quizCurrentIdx === 0}
              activeOpacity={0.7}
            >
              <ChevLeft size={18} color="#282A32" strokeWidth={2.5} />
              <Text style={styles.quizNavBtnText}>Prev</Text>
            </TouchableOpacity>

            {quizCurrentIdx < total - 1 ? (
              <TouchableOpacity
                style={[styles.quizNavBtn, { flex: 1, justifyContent: 'center', backgroundColor: '#F4F4F8' }]}
                onPress={() => setQuizCurrentIdx(i => Math.min(total - 1, i + 1))}
                activeOpacity={0.7}
              >
                <Text style={styles.quizNavBtnText}>Next</Text>
                <ChevronRight size={18} color="#282A32" strokeWidth={2.5} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.quizSubmitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSubmitProposal}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Send size={16} color="#FFF" strokeWidth={2.5} />}
                <Text style={styles.quizSubmitBtnText}>{submitting ? 'Submitting…' : 'Submit Proposal'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Question dots */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dotRow}>
            {questions.map((ques, i) => {
              const answered = !!quizAnswers[ques.id];
              const isCurrent = i === quizCurrentIdx;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dot,
                    answered && styles.dotAnswered,
                    isCurrent && styles.dotCurrent,
                  ]}
                  onPress={() => setQuizCurrentIdx(i)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dotText, answered && { color: '#FFF' }]}>{i + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.quizInfoBox}>
            <Text style={styles.quizInfoText}>
              This quiz is based on the job description. Your score will be visible to the client alongside your proposal.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Modals */}
        {renderSuccessModal()}
        {renderFailModal()}
      </KeyboardAvoidingView>
    );
  }

  // ── Form step (original UI) ────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.wrapper}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#282A32" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Submit Proposal</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Apply-to card */}
        <View style={styles.applyToCard}>
          <Text style={styles.applyToLabel}>Apply to</Text>
          <Text style={styles.applyToTitle} numberOfLines={showDetails ? undefined : 3}>
            {project?.title || "Project"}
          </Text>
          <Text style={styles.applyToMeta}>{timeAgo(project?.createdAt)}</Text>
          <View style={styles.applyToMetaRow}>
            <Text style={styles.applyToMetaLine2}>Payment Verified</Text>
            <CheckCircle size={16} color="#282A32" style={{ marginLeft: 6 }} />
          </View>
          <TouchableOpacity style={styles.showDetailsRow} onPress={() => setShowDetails(!showDetails)}>
            <Text style={styles.showDetailsText}>Show Details</Text>
            {showDetails ? <ChevronUp size={18} color="#282A32" /> : <ChevronDown size={18} color="#282A32" />}
          </TouchableOpacity>

          {showDetails && project && (
            <View style={styles.detailsBlock}>
              {project.description ? (
                <>
                  <Text style={styles.detailsHeading}>Job Description</Text>
                  <Text style={styles.detailsText}>{project.description}</Text>
                </>
              ) : null}
              <View style={styles.detailsGrid}>
                {project.budget != null && (
                  <View style={styles.detailsGridItem}>
                    <DollarSign size={18} color="#282A32" />
                    <Text style={styles.detailsGridLabel}>Budget</Text>
                    <Text style={styles.detailsGridValue}>{formatCurrency(project.budget, project.currency || "USD")}</Text>
                  </View>
                )}
                {!!project.duration && (
                  <View style={styles.detailsGridItem}>
                    <Calendar size={18} color="#282A32" />
                    <Text style={styles.detailsGridLabel}>Duration</Text>
                    <Text style={styles.detailsGridValue}>{project.duration}</Text>
                  </View>
                )}
                {!!project.location && (
                  <View style={styles.detailsGridItem}>
                    <MapPin size={18} color="#282A32" />
                    <Text style={styles.detailsGridLabel}>Location</Text>
                    <Text style={styles.detailsGridValue}>{project.location}</Text>
                  </View>
                )}
              </View>
              {(project.tags?.length ?? 0) > 0 && (
                <>
                  <Text style={styles.detailsHeading}>Skills Required</Text>
                  <View style={styles.tagsWrap}>
                    {project.tags.map((tag, i) => (
                      <View key={i} style={styles.detailTag}>
                        <Text style={styles.detailTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        {/* Quiz info banner */}
        <View style={styles.quizBanner}>
          <Award size={18} color="#4F46E5" strokeWidth={2.5} />
          <Text style={styles.quizBannerText}>
            After filling this form, you'll take a 10-question quiz based on the job description. Your score will be shown to the client.
          </Text>
        </View>

        {/* Bid Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Bid</Text>
          <Text style={styles.bidDesc}>
            Enter the total amount you want to bid for this project. Milestones will be set by the client after your proposal is accepted.
          </Text>

          <View style={[
            styles.amountInputWrapper,
            submitAttempted && !(parseFloat(bidAmount) > 0) && styles.amountInputError,
          ]}>
            <Text style={styles.amountPrefix}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={bidAmount}
              onChangeText={setBidAmount}
            />
            {project?.currency && project.currency !== "USD" && (
              <Text style={styles.currencyLabel}>{project.currency}</Text>
            )}
          </View>
          {submitAttempted && !(parseFloat(bidAmount) > 0) && (
            <Text style={styles.fieldError}>Please enter a valid bid amount</Text>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Bid</Text>
            <Text style={styles.totalValue}>
              {parseFloat(bidAmount) > 0
                ? formatCurrency(parseFloat(bidAmount), project?.currency || "USD")
                : "—"}
            </Text>
          </View>
        </View>

        {/* Cover Letter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Letter</Text>
          <TextInput
            style={[
              styles.input,
              styles.coverLetterInput,
              submitAttempted && !coverLetter.trim() && styles.inputError,
            ]}
            placeholder="Write your cover letter here…"
            placeholderTextColor="#94A3B8"
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            textAlignVertical="top"
          />
          {submitAttempted && !coverLetter.trim() && (
            <Text style={styles.fieldError}>Cover letter is required</Text>
          )}
        </View>

        {/* Continue to quiz button */}
        <TouchableOpacity
          style={[styles.sendBtn, quizLoading && styles.sendBtnDisabled]}
          onPress={handleContinueToQuiz}
          disabled={quizLoading}
        >
          {quizLoading
            ? <ActivityIndicator color="#fff" />
            : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.sendBtnText}>Continue to Quiz</Text>
                <ChevronRight size={18} color="#FFF" strokeWidth={2.5} />
              </View>
            )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {renderSuccessModal()}
      {renderFailModal()}
    </KeyboardAvoidingView>
  );

  // ── Fail modal ─────────────────────────────────────────────────────────────

  function renderFailModal() {
    if (!failInfo) return null;
    const isPermanent  = failInfo.permanentlyBlocked;
    const attemptsLeft = 3 - failInfo.attemptNumber;
    const canRetryNow  = !isPermanent && retryCountdown === 'Ready to retry';

    const handleRetry = () => {
      setShowFailModal(false);
      setFailInfo(null);
      setQuizSession(null);
      setQuizAnswers({});
      setQuizCurrentIdx(0);
      setStep('form');
    };

    const handlePermanentBlock = () => {
      setShowFailModal(false);
      setBlockInfo({ permanentlyBlocked: true });
      setStep('blocked');
    };

    return (
      <Modal
        visible={showFailModal}
        transparent
        animationType="fade"
        onRequestClose={() => isPermanent ? handlePermanentBlock() : setShowFailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 360 }]}>
            <XCircle size={52} color="#EF4444" style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Quiz Failed</Text>

            {/* Score box */}
            <View style={[styles.modalScoreBox, { borderColor: '#FCA5A5' }]}>
              <Text style={styles.modalScoreLabel}>Your Score</Text>
              <Text style={[styles.modalScoreValue, { color: '#EF4444' }]}>{failInfo.score}%</Text>
              <Text style={styles.modalScoreSub}>
                {failInfo.correct}/{failInfo.total} correct · needed {failInfo.threshold}% to pass
              </Text>
            </View>

            {isPermanent ? (
              <>
                <Text style={[styles.modalMessage, { color: '#EF4444', fontWeight: '700' }]}>
                  You have used all 3 attempts.{'\n'}You are permanently blocked from this project.
                </Text>
                <View style={[styles.blockBadgeTip, { marginBottom: 20 }]}>
                  <Award size={16} color="#4F46E5" strokeWidth={2} />
                  <Text style={styles.blockBadgeTipText}>
                    Earn a verified skill badge to unlock one final attempt.
                  </Text>
                </View>
                <TouchableOpacity style={styles.modalButton} onPress={handlePermanentBlock} activeOpacity={0.8}>
                  <Text style={styles.modalButtonText}>View Block Details</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalMessage}>
                  {attemptsLeft === 1
                    ? '⚠️  1 attempt remaining — next fail is a permanent block.'
                    : `You have ${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} remaining.`}
                </Text>

                {/* Countdown */}
                {!canRetryNow && (
                  <View style={styles.blockCountdownBox}>
                    <Clock size={16} color="#F59E0B" strokeWidth={2} />
                    <Text style={[styles.blockCountdownText, { color: '#F59E0B', fontSize: 15 }]}>
                      Retry in: {retryCountdown || '…'}
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginTop: 8 }}>
                  <TouchableOpacity
                    style={[styles.blockBackBtn, { flex: 1, marginTop: 0 }]}
                    onPress={() => { setShowFailModal(false); router.back(); }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.blockBackBtnText}>Back</Text>
                  </TouchableOpacity>
                  {canRetryNow && (
                    <TouchableOpacity
                      style={[styles.blockRetryBtn, { flex: 1, marginTop: 0 }]}
                      onPress={handleRetry}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.blockRetryBtnText}>Try Again</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  // ── Success modal (shared between both steps) ──────────────────────────────

  function renderSuccessModal() {
    const scoreColor = !quizResult ? '#10B981'
      : quizResult.score >= 70 ? '#10B981'
      : quizResult.score >= 40 ? '#F59E0B'
      : '#EF4444';

    return (
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => { setShowSuccess(false); router.replace("/(tabs)" as any); }}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => { setShowSuccess(false); router.replace("/(tabs)" as any); }}
        >
          <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()} style={styles.modalCard}>
            <CheckCircle size={52} color="#10B981" style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Proposal Sent!</Text>

            {quizResult && (
              <View style={styles.modalScoreBox}>
                <Text style={styles.modalScoreLabel}>Your Quiz Score</Text>
                <Text style={[styles.modalScoreValue, { color: scoreColor }]}>{quizResult.score}%</Text>
                <Text style={styles.modalScoreSub}>
                  {quizResult.correct}/{quizResult.total} correct
                </Text>
              </View>
            )}

            <Text style={styles.modalMessage}>
              Your proposal and quiz score have been submitted.{'\n'}The client can now review your application.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => { setShowSuccess(false); router.replace("/(tabs)" as any); }}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC", padding: 32 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20, paddingTop: 4,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#FFF", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1E293B" },

  applyToCard: {
    backgroundColor: "#FFF", borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0",
  },
  applyToLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "700", letterSpacing: 0.8, marginBottom: 6, textTransform: "uppercase" },
  applyToTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 6, lineHeight: 22 },
  applyToMeta: { fontSize: 12, color: "#94A3B8", marginBottom: 4 },
  applyToMetaRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  applyToMetaLine2: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  showDetailsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  showDetailsText: { fontSize: 14, color: "#282A32", fontWeight: "600" },
  detailsBlock: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  detailsHeading: { fontSize: 13, fontWeight: "700", color: "#1E293B", marginBottom: 6 },
  detailsText: { fontSize: 13, color: "#64748B", lineHeight: 20, marginBottom: 12 },
  detailsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  detailsGridItem: { minWidth: "28%", backgroundColor: "#F8FAFC", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  detailsGridLabel: { fontSize: 10, color: "#94A3B8", marginTop: 4 },
  detailsGridValue: { fontSize: 13, fontWeight: "700", color: "#1E293B", marginTop: 2 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  detailTag: { backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  detailTagText: { fontSize: 12, fontWeight: "600", color: "#475569" },

  // Quiz banner
  quizBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#EEF2FF', borderRadius: 12, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  quizBannerText: { flex: 1, fontSize: 13, color: '#3730A3', lineHeight: 19, fontWeight: '500' },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1E293B", marginBottom: 6 },
  bidDesc: { fontSize: 13, color: "#94A3B8", lineHeight: 19, marginBottom: 14 },

  amountInputWrapper: {
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 14, backgroundColor: "#FFF", height: 52, marginBottom: 6,
  },
  amountInputError: { borderColor: "#EF4444", borderWidth: 1.5 },
  amountPrefix: { fontSize: 16, fontWeight: "700", color: "#64748B", marginRight: 6 },
  amountInput: { fontSize: 18, color: "#1E293B", fontWeight: "700", flex: 1, paddingVertical: 0, borderWidth: 0, outlineStyle: "none" as any },
  currencyLabel: { fontSize: 13, color: "#94A3B8", fontWeight: "600", marginLeft: 6 },

  totalRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#1E293B", borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, marginTop: 12,
  },
  totalLabel: { fontSize: 13, color: "#94A3B8", fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  totalValue: { fontSize: 20, color: "#FFF", fontWeight: "800" },

  input: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 12, backgroundColor: "#F8FAFC", fontSize: 14, color: "#1E293B" },
  inputError: { borderColor: "#EF4444", borderWidth: 1.5 },
  fieldError: { color: "#EF4444", fontSize: 11, fontWeight: "600" as const, marginTop: 3 },
  coverLetterInput: { height: 120, paddingTop: 12, textAlignVertical: "top" },

  sendBtn: { backgroundColor: "#1E293B", paddingVertical: 16, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 4 },
  sendBtnDisabled: { opacity: 0.6 },
  sendBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16, letterSpacing: 0.3 },

  // ── Quiz styles ─────────────────────────────────────────────
  quizLoadingText: { fontSize: 16, fontWeight: '700', color: '#282A32', marginTop: 20, textAlign: 'center' },
  quizLoadingSubtext: { fontSize: 13, color: '#94A3B8', marginTop: 6 },

  quizHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  quizHeaderTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  quizHeaderSub: { fontSize: 11, color: '#94A3B8', fontWeight: '500', marginTop: 2 },

  quizProgressWrap: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  quizProgressBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  quizProgressFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 3 },
  quizProgressLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },

  quizContent: { padding: 20, paddingBottom: 40 },

  quizCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  quizQNumRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  quizQNumBadge: { backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  quizQNumText: { fontSize: 12, fontWeight: '800', color: '#4F46E5' },
  quizQTotal: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  quizQuestionText: { fontSize: 15, fontWeight: '600', color: '#1E293B', lineHeight: 22 },

  quizOption: {
    backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  quizOptionSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  quizOptLabel: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center',
  },
  quizOptLabelSelected: { backgroundColor: '#4F46E5' },
  quizOptLabelText: { fontSize: 13, fontWeight: '800', color: '#475569' },
  quizOptText: { flex: 1, fontSize: 14, color: '#475569', fontWeight: '500' },
  quizOptTextSelected: { color: '#3730A3', fontWeight: '700' },

  quizNavRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 16 },
  quizNavBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
  },
  quizNavBtnText: { fontSize: 14, fontWeight: '700', color: '#282A32' },
  quizSubmitBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 14,
  },
  quizSubmitBtnText: { fontSize: 15, fontWeight: '800', color: '#FFF' },

  dotRow: { marginBottom: 16 },
  dot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center', marginRight: 6,
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  dotAnswered: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  dotCurrent: { borderColor: '#4F46E5', borderWidth: 2.5 },
  dotText: { fontSize: 11, fontWeight: '800', color: '#475569' },

  quizInfoBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  quizInfoText: { fontSize: 12, color: '#64748B', lineHeight: 18, textAlign: 'center' },

  // ── Modal ───────────────────────────────────────────────────
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalCard: {
    backgroundColor: "#FFF", borderRadius: 20, padding: 28, alignItems: "center",
    minWidth: 280, maxWidth: 340,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20 },
      android: { elevation: 12 },
    }),
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1E293B", marginBottom: 12 },
  modalScoreBox: {
    backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16, marginBottom: 16,
    alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#E2E8F0',
  },
  modalScoreLabel: { fontSize: 12, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  modalScoreValue: { fontSize: 40, fontWeight: '900', marginBottom: 2 },
  modalScoreSub: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  modalMessage: { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  modalButton: { backgroundColor: "#1E293B", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, width: "100%", alignItems: "center" },
  modalButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  // ── Block screen ────────────────────────────────────────────────────────
  blockIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  blockTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 10, textAlign: 'center' },
  blockMsg: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 20, paddingHorizontal: 8 },
  blockCountdownBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFFBEB', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 12,
    borderWidth: 1, borderColor: '#FDE68A', marginBottom: 16,
  },
  blockCountdownText: { fontSize: 17, fontWeight: '800' },
  blockWarning: {
    backgroundColor: '#FFF7ED', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#FED7AA', marginBottom: 20,
  },
  blockWarningText: { fontSize: 13, color: '#92400E', lineHeight: 20, textAlign: 'center' },
  blockBadgeTip: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#EEF2FF', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#C7D2FE', marginBottom: 24, marginHorizontal: 4,
  },
  blockBadgeTipText: { flex: 1, fontSize: 13, color: '#3730A3', lineHeight: 19 },
  blockRetryBtn: {
    backgroundColor: '#1E293B', paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', width: '100%', marginTop: 8,
  },
  blockRetryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  blockBackBtn: {
    backgroundColor: '#F1F5F9', paddingVertical: 13, borderRadius: 12,
    alignItems: 'center', width: '100%', marginTop: 8,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  blockBackBtnText: { color: '#475569', fontSize: 15, fontWeight: '700' },
});
