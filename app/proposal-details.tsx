import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, DollarSign, FileText, User } from 'lucide-react-native';
import { Proposal } from '@/models/Project';
import { proposalService } from '@/services/projectService';
import { COLORS } from '@/utils/constants';

export default function ProposalDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposal = useCallback(async () => {
    if (!id) {
      setProposal(null);
      setError('Missing proposal id.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetched = await proposalService.getProposalById(id);
      setProposal(fetched);
    } catch (e: any) {
      setProposal(null);
      setError(e?.message || 'Failed to load proposal.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchProposal();
  }, [fetchProposal]);

  const createdLabel = useMemo(() => {
    if (!proposal?.createdAt) return null;
    const d = new Date(proposal.createdAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString();
  }, [proposal?.createdAt]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading proposal...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Couldn’t load proposal</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <View style={styles.errorActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()} activeOpacity={0.85}>
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={fetchProposal} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (!proposal) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Proposal not found</Text>
          <Text style={styles.errorMessage}>The proposal may have been removed.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const title = proposal.project?.title || 'Proposal Details';
  const freelancerName = proposal.freelancer?.userName || proposal.freelancer?.name || 'Freelancer';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <ArrowLeft size={22} color={COLORS.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            <User size={18} color={COLORS.gray500} />
            <Text style={styles.rowLabel}>Freelancer</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {freelancerName}
            </Text>
          </View>

          <View style={styles.row}>
            <DollarSign size={18} color={COLORS.gray500} />
            <Text style={styles.rowLabel}>Bid</Text>
            <Text style={styles.rowValue}>${proposal.bidAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <FileText size={18} color={COLORS.gray500} />
            <Text style={styles.rowLabel}>Status</Text>
            <Text style={styles.rowValue}>{proposal.status}</Text>
          </View>

          {createdLabel && <Text style={styles.metaText}>Submitted {createdLabel}</Text>}
        </View>

        <Text style={styles.sectionTitle}>Cover Letter</Text>
        <View style={styles.card}>
          <Text style={styles.paragraph}>
            {proposal.coverLetter?.trim() ? proposal.coverLetter : 'No cover letter provided.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.gray800,
    marginHorizontal: 12,
  },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.gray800,
    marginBottom: 10,
    marginTop: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  rowLabel: { color: COLORS.gray500, fontSize: 12, fontWeight: '700', width: 70 },
  rowValue: {
    flex: 1,
    color: COLORS.gray800,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  metaText: { marginTop: 6, color: COLORS.gray500, fontSize: 12, fontWeight: '600' },
  paragraph: { color: COLORS.gray700, fontSize: 14, lineHeight: 20 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.gray100,
  },
  loadingText: { marginTop: 10, color: COLORS.gray500, fontSize: 14, fontWeight: '600' },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.gray100,
  },
  errorCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  errorTitle: { fontSize: 18, fontWeight: '800', color: COLORS.gray800, marginBottom: 6 },
  errorMessage: { fontSize: 14, color: COLORS.gray600, lineHeight: 20 },
  errorActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  secondaryButtonText: { color: COLORS.gray800, fontSize: 14, fontWeight: '800' },
});
