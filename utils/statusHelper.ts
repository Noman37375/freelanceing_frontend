import { DISPUTE_STATUSES, COLORS } from './constants';

export type DisputeStatus = typeof DISPUTE_STATUSES[keyof typeof DISPUTE_STATUSES];

/**
 * Normalizes legacy and inconsistent status strings into standard snake_case.
 * Prevents filters from breaking due to "Pending" vs "open" mismatches.
 */
export const normalizeDisputeStatus = (status: string): DisputeStatus => {
  if (!status) return DISPUTE_STATUSES.OPEN;

  const map: Record<string, DisputeStatus> = {
    'Pending': DISPUTE_STATUSES.OPEN,
    'Under Review': DISPUTE_STATUSES.UNDER_REVIEW,
    'Resolved': DISPUTE_STATUSES.RESOLVED,
    'Denied': DISPUTE_STATUSES.CLOSED,
    'Closed': DISPUTE_STATUSES.CLOSED,
    'mediation': DISPUTE_STATUSES.MEDIATION,
    'escalated': DISPUTE_STATUSES.ESCALATED,
  };

  return map[status] || (status.toLowerCase() as DisputeStatus);
};

/**
 * Returns the correct theme color based on the normalized status.
 */
export const getStatusThemeColor = (status: string) => {
  const normalized = normalizeDisputeStatus(status);
  switch (normalized) {
    case DISPUTE_STATUSES.OPEN: return COLORS.info;
    case DISPUTE_STATUSES.UNDER_REVIEW: return COLORS.warning;
    case DISPUTE_STATUSES.MEDIATION: return '#8B5CF6'; // Indigo/Purple for Mediation
    case DISPUTE_STATUSES.ESCALATED: return COLORS.error;
    case DISPUTE_STATUSES.RESOLVED: return COLORS.success;
    case DISPUTE_STATUSES.CLOSED: return COLORS.gray500;
    default: return COLORS.primary;
  }
};