import { getProjectDisplayStatus, type Project } from '@/models/Project';
import {
  normalizeDisputeStatus,
  disputeFilterToApiStatus,
} from '@/models/Dispute';

// ─── Project model ────────────────────────────────────────────────────────────

function makeProject(status: Project['status']): Project {
  return {
    id: 'p1',
    title: 'Test',
    description: 'desc',
    clientId: 'c1',
    budget: 100,
    bidsCount: 0,
    tags: [],
    status,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('getProjectDisplayStatus', () => {
  it.each([
    ['ACTIVE',      'Active'],
    ['IN_PROGRESS', 'In Progress'],
    ['COMPLETED',   'Completed'],
    ['CANCELLED',   'Cancelled'],
  ] as [Project['status'], string][])(
    'maps %s → %s',
    (status, expected) => {
      expect(getProjectDisplayStatus(makeProject(status))).toBe(expected);
    }
  );

  it('defaults to Active for unknown status', () => {
    const project = makeProject('ACTIVE');
    (project as any).status = 'WHATEVER';
    expect(getProjectDisplayStatus(project)).toBe('Active');
  });
});

// ─── Dispute model helpers ────────────────────────────────────────────────────

describe('normalizeDisputeStatus', () => {
  it.each([
    ['Pending',      'open'],
    ['Under Review', 'under_review'],
    ['Resolved',     'resolved'],
    ['Denied',       'denied'],
    ['Closed',       'closed'],
  ])('maps legacy "%s" → "%s"', (input, expected) => {
    expect(normalizeDisputeStatus(input)).toBe(expected);
  });

  it('passes through already-canonical status unchanged', () => {
    expect(normalizeDisputeStatus('open')).toBe('open');
    expect(normalizeDisputeStatus('escalated')).toBe('escalated');
    expect(normalizeDisputeStatus('mediation')).toBe('mediation');
  });
});

describe('disputeFilterToApiStatus', () => {
  it('maps Pending → open', () => {
    expect(disputeFilterToApiStatus('Pending')).toBe('open');
  });
  it('maps Resolved → resolved', () => {
    expect(disputeFilterToApiStatus('Resolved')).toBe('resolved');
  });
  it('maps Denied → denied', () => {
    expect(disputeFilterToApiStatus('Denied')).toBe('denied');
  });
  it('returns undefined for unknown filter', () => {
    expect(disputeFilterToApiStatus('All')).toBeUndefined();
  });
});
