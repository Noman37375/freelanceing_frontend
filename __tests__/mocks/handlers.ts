import { http, HttpResponse } from 'msw';

const BASE = 'https://backend-brown-theta-94.vercel.app';

// ─── Shared fixture data ───────────────────────────────────────────────────────

const mockProject = {
  id: 'proj-1',
  title: 'Test Project',
  description: 'A test project',
  clientId: 'client-1',
  budget: 500,
  currency: 'USD',
  bidsCount: 2,
  tags: ['react', 'node'],
  status: 'ACTIVE' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockWallet = {
  id: 'wallet-1',
  userId: 'user-1',
  balance: 1000,
  escrowBalance: 200,
  total: 1200,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockTransaction = {
  id: 'txn-1',
  walletId: 'wallet-1',
  userId: 'user-1',
  type: 'deposit' as const,
  amount: 100,
  status: 'completed' as const,
  createdAt: '2026-01-01T00:00:00Z',
};

const mockDispute = {
  id: 'dispute-1',
  projectId: 'proj-1',
  contractId: 'contract-1',
  initiatorId: 'user-1',
  respondentId: 'user-2',
  initiator: { name: 'Alice', role: 'client' as const },
  respondent: { name: 'Bob', role: 'freelancer' as const },
  reason: 'quality_issues' as const,
  title: 'Work not delivered',
  description: 'The deliverable was not up to standard.',
  amount: 150,
  currency: 'USD',
  evidence: [],
  status: 'open' as const,
  priority: 'medium' as const,
  messages: [],
  timeline: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

// ─── Handlers ─────────────────────────────────────────────────────────────────

export const handlers = [
  // Projects – list
  http.get(`${BASE}/api/v1/projects`, () =>
    HttpResponse.json({ data: { projects: [mockProject] } })
  ),

  // Projects – create
  http.post(`${BASE}/api/v1/projects`, async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    if (!body.paymentIntentId) {
      return HttpResponse.json({ message: 'paymentIntentId is required' }, { status: 400 });
    }
    return HttpResponse.json({ data: { project: { ...mockProject, ...body, id: 'proj-new' } } }, { status: 201 });
  }),

  // Projects – delete
  http.delete(`${BASE}/api/v1/projects/:id`, () =>
    HttpResponse.json({ message: 'Project deleted' })
  ),

  // Projects – get by id
  http.get(`${BASE}/api/v1/projects/:id`, ({ params }) =>
    HttpResponse.json({ data: { project: { ...mockProject, id: params.id } } })
  ),

  // Wallet – get
  http.get(`${BASE}/api/v1/wallet`, () =>
    HttpResponse.json({ data: { wallet: mockWallet } })
  ),

  // Wallet – transactions
  http.get(`${BASE}/api/v1/wallet/transactions`, () =>
    HttpResponse.json({ data: { transactions: [mockTransaction] } })
  ),

  // Wallet – add funds
  http.post(`${BASE}/api/v1/wallet/add-funds`, async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    if (!body.paymentIntentId) {
      return HttpResponse.json({ message: 'paymentIntentId is required' }, { status: 400 });
    }
    const updated = { ...mockWallet, balance: mockWallet.balance + Number(body.amount) };
    return HttpResponse.json({ data: { wallet: updated, transaction: { ...mockTransaction, amount: body.amount } } });
  }),

  // Wallet – withdraw
  http.post(`${BASE}/api/v1/wallet/withdraw`, async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    const updated = { ...mockWallet, balance: mockWallet.balance - Number(body.amount) };
    return HttpResponse.json({ data: { wallet: updated, transaction: { ...mockTransaction, type: 'withdrawal', amount: body.amount } } });
  }),

  // Stripe – create payment intent
  http.post(`${BASE}/api/v1/stripe/create-payment-intent`, async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    return HttpResponse.json({
      data: {
        clientSecret: `pi_${body.amount}_secret`,
        paymentIntentId: `pi_${body.amount}`,
      },
    });
  }),

  // Disputes – list
  http.get(`${BASE}/api/v1/disputes`, () =>
    HttpResponse.json({ data: { disputes: [mockDispute] } })
  ),

  // Disputes – get by id
  http.get(`${BASE}/api/v1/disputes/:id`, ({ params }) =>
    HttpResponse.json({ data: { dispute: { ...mockDispute, id: params.id } } })
  ),

  // Disputes – create
  http.post(`${BASE}/api/v1/disputes`, async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    return HttpResponse.json({ data: { dispute: { ...mockDispute, ...body, id: 'dispute-new' } } }, { status: 201 });
  }),

  // Disputes – update status
  http.put(`${BASE}/api/v1/disputes/:id/status`, async ({ params, request }) => {
    const body = await request.json() as Record<string, any>;
    return HttpResponse.json({ data: { dispute: { ...mockDispute, id: params.id, status: body.status } } });
  }),
];
