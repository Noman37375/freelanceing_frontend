import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  ArrowLeft,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';


interface Evidence {
  id: string;
  type: 'document' | 'image' | 'message';
  title: string;
  description: string;
  date: string;
}

type DisputeStatus = 'Pending' | 'Approved' | 'Denied';

const DISPUTE_DATA: {
  id: string;
  projectTitle: string;
  freelancerName: string;
  clientName: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  createdDate: string;
  amount: string;
  milestoneNumber: number;
} = {
  id: '1',
  projectTitle: 'Mobile App UI/UX Design',
  freelancerName: 'Sarah Johnson',
  clientName: 'John Doe',
  reason: 'Milestone not delivered as per requirements',
  description:
    'The freelancer submitted the second milestone (High-Fidelity Mockups) but the designs do not match the requirements outlined in the project brief. Key features are missing and the color scheme is completely different from what was agreed upon.',
  status: 'Pending',
  createdDate: 'Dec 12, 2025',
  amount: '$1,000',
  milestoneNumber: 2,
};

const EVIDENCE_DATA: Evidence[] = [
  {
    id: '1',
    type: 'document',
    title: 'Original Project Brief',
    description: 'The initial requirements and specifications agreed upon',
    date: 'Dec 1, 2025',
  },
  {
    id: '2',
    type: 'image',
    title: 'Submitted Mockups',
    description: 'Screenshots of the designs submitted by freelancer',
    date: 'Dec 10, 2025',
  },
  {
    id: '3',
    type: 'message',
    title: 'Chat History',
    description: 'Conversation showing agreed requirements and feedback',
    date: 'Dec 1-11, 2025',
  },
  {
    id: '4',
    type: 'image',
    title: 'Reference Designs',
    description: 'Examples and references shared during project discussion',
    date: 'Dec 2, 2025',
  },
];

const ADMIN_REVIEW = {
  status: 'under_review' as const,
  message:
    'Your dispute is currently being reviewed by our admin team. We will notify you once a decision has been made. Expected resolution time: 24-48 hours.',
  reviewedBy: null,
  reviewDate: null,
  decision: null,
};

export default function DisputeDetail() {
  const router = useRouter();
  const getEvidenceIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'document':
        return <FileText size={20} color="#3B82F6" strokeWidth={2} />;
      case 'image':
        return <ImageIcon size={20} color="#10B981" strokeWidth={2} />;
      case 'message':
        return <MessageSquare size={20} color="#F59E0B" strokeWidth={2} />;
    }
  };

  const getStatusIcon = () => {
    switch (DISPUTE_DATA.status) {
      case 'Pending':
        return <Clock size={24} color="#F59E0B" strokeWidth={2} />;
      case 'Approved':
        return <CheckCircle2 size={24} color="#10B981" strokeWidth={2} />;
      case 'Denied':
        return <XCircle size={24} color="#EF4444" strokeWidth={2} />;
    }
  };

  const getStatusColor = () => {
    switch (DISPUTE_DATA.status) {
      case 'Pending':
        return '#F59E0B';
      case 'Approved':
        return '#10B981';
      case 'Denied':
        return '#EF4444';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {getStatusIcon()}
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={[styles.statusValue, { color: getStatusColor() }]}>
                {DISPUTE_DATA.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.projectTitle}>{DISPUTE_DATA.projectTitle}</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <User size={16} color="#6B7280" strokeWidth={2} />
                <Text style={styles.infoText}>{DISPUTE_DATA.freelancerName}</Text>
              </View>
              <View style={styles.infoItem}>
                <DollarSign size={16} color="#6B7280" strokeWidth={2} />
                <Text style={styles.infoText}>{DISPUTE_DATA.amount}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Calendar size={16} color="#6B7280" strokeWidth={2} />
                <Text style={styles.infoText}>{DISPUTE_DATA.createdDate}</Text>
              </View>
              <View style={styles.infoItem}>
                <AlertCircle size={16} color="#6B7280" strokeWidth={2} />
                <Text style={styles.infoText}>Milestone {DISPUTE_DATA.milestoneNumber}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Dispute</Text>
          <View style={styles.reasonCard}>
            <Text style={styles.reasonTitle}>{DISPUTE_DATA.reason}</Text>
            <Text style={styles.reasonDescription}>{DISPUTE_DATA.description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submitted Evidence</Text>
          {EVIDENCE_DATA.map((evidence) => (
            <TouchableOpacity key={evidence.id} style={styles.evidenceCard}>
              <View style={styles.evidenceIcon}>{getEvidenceIcon(evidence.type)}</View>
              <View style={styles.evidenceInfo}>
                <Text style={styles.evidenceTitle}>{evidence.title}</Text>
                <Text style={styles.evidenceDescription}>{evidence.description}</Text>
                <Text style={styles.evidenceDate}>{evidence.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addEvidenceButton}>
            <FileText size={18} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.addEvidenceText}>Add More Evidence</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Review</Text>
          <View style={styles.reviewCard}>
            {ADMIN_REVIEW.status === 'under_review' ? (
              <>
                <View style={styles.reviewHeader}>
                  <Clock size={20} color="#F59E0B" strokeWidth={2} />
                  <Text style={styles.reviewStatus}>Under Review</Text>
                </View>
                <Text style={styles.reviewMessage}>{ADMIN_REVIEW.message}</Text>
              </>
            ) : DISPUTE_DATA.status === 'Approved' ? (
              <>
                <View style={styles.reviewHeader}>
                  <CheckCircle2 size={20} color="#10B981" strokeWidth={2} />
                  <Text style={[styles.reviewStatus, { color: '#10B981' }]}>
                    Dispute Approved
                  </Text>
                </View>
                <Text style={styles.reviewMessage}>
                  After reviewing the evidence, we have decided in your favor. The disputed
                  amount will be refunded to your wallet within 2-3 business days.
                </Text>
              </>
            ) : (
              <>
                <View style={styles.reviewHeader}>
                  <XCircle size={20} color="#EF4444" strokeWidth={2} />
                  <Text style={[styles.reviewStatus, { color: '#EF4444' }]}>
                    Dispute Denied
                  </Text>
                </View>
                <Text style={styles.reviewMessage}>
                  After careful review of the evidence, we found that the freelancer met the
                  project requirements. The payment will proceed to the freelancer.
                </Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.contactButton}>
            <MessageSquare size={18} color="#3B82F6" strokeWidth={2} />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
          {DISPUTE_DATA.status === 'Pending' && (
            <TouchableOpacity style={styles.withdrawButton}>
              <Text style={styles.withdrawButtonText}>Withdraw Dispute</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  statusCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  reasonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  reasonDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  evidenceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  evidenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  evidenceInfo: {
    flex: 1,
  },
  evidenceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  evidenceDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  evidenceDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  addEvidenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  addEvidenceText: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  reviewStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
  },
  reviewMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  contactButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  withdrawButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
