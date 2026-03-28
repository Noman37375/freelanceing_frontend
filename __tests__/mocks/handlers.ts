import { http, HttpResponse } from 'msw';

// The API base URL used by services in the test (Node) environment:
// config.js falls back to vercel URL when window is undefined.
const API = 'https://backend-brown-theta-94.vercel.app';

// ─── Fixture data ────────────────────────────────────────────────────────────

export const mockProject = {
  id: 'proj-1',
  title: 'Build a mobile app',
  description: 'React Native project',
  clientId: 'client-1',
  budget: 2000,
  currency: 'USD',
  status: 'ACTIVE' as const,
  bidsCount: 3,
  tags: ['react-native', 'typescript'],
  category: 'Mobile Development',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

export const mockWallet = {
  id: 'wallet-1',
  userId: 'client-1',
  balance: 500,
  escrowBalance: 200,
  total: 700,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export const mockTransaction = {
  id: 'txn-1',
  walletId: 'wallet-1',
  userId: 'client-1',
  type: 'deposit' as const,
  amount: 500,
  status: 'completed' as const,
  createdAt: '2026-01-15T10:00:00Z',
};

// ─── Handlers ────────────────────────────────────────────────────────────────

export const handlers = [
  // Projects
  http.get(`${API}/api/v1/projects`, () =>
    HttpResponse.json({ data: { projects: [mockProject] } })
  ),

  http.get(`${API}/api/v1/projects/:id`, ({ params }) =>
    HttpResponse.json({ data: { project: { ...mockProject, id: params.id as string } } })
  ),

  http.post(`${API}/api/v1/projects`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      data: { project: { ...mockProject, ...body, id: 'proj-new' } },
    }, { status: 201 });
  }),

  http.delete(`${API}/api/v1/projects/:id`, () =>
    HttpResponse.json({ message: 'Project deleted' })
  ),

  // Wallet
  http.get(`${API}/api/v1/wallet`, () =>
    HttpResponse.json({ data: { wallet: mockWallet } })
  ),

  http.get(`${API}/api/v1/wallet/transactions`, () =>
    HttpResponse.json({ data: { transactions: [mockTransaction] } })
  ),

  http.post(`${API}/api/v1/wallet/add-funds`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    if (!body.paymentIntentId) {
      return HttpResponse.json({ message: 'paymentIntentId is required' }, { status: 400 });
    }
    const updated = { ...mockWallet, balance: mockWallet.balance + (body.amount as number) };
    return HttpResponse.json({ data: { wallet: updated, transaction: mockTransaction } });
  }),

  http.post(`${API}/api/v1/wallet/withdraw`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const updated = { ...mockWallet, balance: mockWallet.balance - (body.amount as number) };
    return HttpResponse.json({ data: { wallet: updated, transaction: mockTransaction } });
  }),

  // Stripe
  http.post(`${API}/api/v1/stripe/create-payment-intent`, async ({ request }) => {
    const body = await request.json() as { amount: number; currency: string; receiptEmail?: string };
    return HttpResponse.json({
      data: {
        clientSecret: `pi_test_secret_${body.amount}`,
        paymentIntentId: `pi_test_${body.amount}`,
      },
    });
  }),
];
