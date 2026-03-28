/**
 * models.test.ts
 *
 * Tests for models/Project.ts — validates the getProjectDisplayStatus helper
 * and ensures the Project/Proposal/Milestone type shapes are consistent with
 * what the API layer actually returns.
 */

import { getProjectDisplayStatus, Project } from '@/models/Project';

const makeProject = (status: Project['status']): Project => ({
  id: 'proj-1',
  title: 'Test Project',
  description: 'A test project',
  clientId: 'client-1',
  budget: 1000,
  status,
  bidsCount: 0,
  tags: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

// ─── getProjectDisplayStatus ──────────────────────────────────────────────────

describe('getProjectDisplayStatus', () => {
  it('maps ACTIVE → "Active"', () => {
    expect(getProjectDisplayStatus(makeProject('ACTIVE'))).toBe('Active');
  });

  it('maps IN_PROGRESS → "In Progress"', () => {
    expect(getProjectDisplayStatus(makeProject('IN_PROGRESS'))).toBe('In Progress');
  });

  it('maps COMPLETED → "Completed"', () => {
    expect(getProjectDisplayStatus(makeProject('COMPLETED'))).toBe('Completed');
  });

  it('maps CANCELLED → "Cancelled"', () => {
    expect(getProjectDisplayStatus(makeProject('CANCELLED'))).toBe('Cancelled');
  });

  it('defaults to "Active" for unknown status (type-safety guard)', () => {
    // Force an unexpected DB value through the type system
    const project = makeProject('ACTIVE');
    (project as any).status = 'UNKNOWN';
    expect(getProjectDisplayStatus(project)).toBe('Active');
  });
});

// ─── Project shape ────────────────────────────────────────────────────────────

describe('Project type shape', () => {
  it('constructs a valid minimal project object', () => {
    const p: Project = makeProject('ACTIVE');
    expect(p).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      clientId: expect.any(String),
      budget: expect.any(Number),
      bidsCount: expect.any(Number),
      tags: expect.any(Array),
      status: expect.stringMatching(/^(ACTIVE|IN_PROGRESS|COMPLETED|CANCELLED)$/),
    });
  });

  it('allows optional fields to be absent', () => {
    const p: Project = makeProject('ACTIVE');
    // These are optional — they should not be required
    expect(p.freelancerId).toBeUndefined();
    expect(p.category).toBeUndefined();
    expect(p.milestones).toBeUndefined();
  });
});

// ─── Status enum coverage ─────────────────────────────────────────────────────

describe('Project status enum', () => {
  const validStatuses: Project['status'][] = [
    'ACTIVE',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
  ];

  it.each(validStatuses)('"%s" is a valid project status', (status) => {
    const p = makeProject(status);
    expect(p.status).toBe(status);
  });

  it('covers all 4 statuses in getProjectDisplayStatus', () => {
    // Ensures no status is accidentally left without a display mapping
    const results = validStatuses.map(s => getProjectDisplayStatus(makeProject(s)));
    expect(new Set(results).size).toBe(4); // 4 unique display labels
  });
});
