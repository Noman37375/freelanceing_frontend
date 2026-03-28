/**
 * walletService.test.ts
 *
 * Tests for walletService — covers the Stripe-gated addFunds flow.
 *
 * Critical: addFunds now requires a confirmed paymentIntentId from Stripe.
 * Calling it without one is rejected by the backend. These tests ensure the
 * service correctly forwards the paymentIntentId and handles errors.
 */

import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { walletService } from '@/services/walletService';
import { mockWallet, mockTransaction } from '../mocks/handlers';

jest.mock('@/utils/storage', () => ({
  storageGet: jest.fn().mockResolvedValue('test-token'),
}));

const API = 'https://backend-brown-theta-94.vercel.app';

// ─── getWallet ────────────────────────────────────────────────────────────────

describe('walletService.getWallet', () => {
  it('returns the user wallet', async () => {
    const wallet = await walletService.getWallet();
    expect(wallet.id).toBe(mockWallet.id);
    expect(wallet.balance).toBe(mockWallet.balance);
    expect(wallet.escrowBalance).toBe(mockWallet.escrowBalance);
  });

  it('throws on non-JSON response', async () => {
    server.use(
      http.get(`${API}/api/v1/wallet`, () =>
        new HttpResponse('<html>error</html>', {
          status: 500,
          headers: { 'content-type': 'text/html' },
        })
      )
    );

    await expect(walletService.getWallet()).rejects.toThrow(/non-JSON/);
  });

  it('throws a network error when fetch fails', async () => {
    server.use(
      http.get(`${API}/api/v1/wallet`, () => HttpResponse.error())
    );

    await expect(walletService.getWallet()).rejects.toThrow(/Network error/);
  });
});

// ─── getTransactions ──────────────────────────────────────────────────────────

describe('walletService.getTransactions', () => {
  it('returns an array of transactions', async () => {
    const txns = await walletService.getTransactions();
    expect(Array.isArray(txns)).toBe(true);
    expect(txns[0].id).toBe(mockTransaction.id);
  });

  it('passes the limit query param when provided', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${API}/api/v1/wallet/transactions`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: { transactions: [] } });
      })
    );

    await walletService.getTransactions(5);

    expect(capturedUrl).toContain('limit=5');
  });

  it('returns empty array when transactions are missing in response', async () => {
    server.use(
      http.get(`${API}/api/v1/wallet/transactions`, () =>
        HttpResponse.json({ data: {} })
      )
    );

    const txns = await walletService.getTransactions();
    expect(txns).toEqual([]);
  });
});

// ─── addFunds ─────────────────────────────────────────────────────────────────

describe('walletService.addFunds', () => {
  it('requires a paymentIntentId — forwards it to the API', async () => {
    let capturedBody: any;
    server.use(
      http.post(`${API}/api/v1/wallet/add-funds`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          data: {
            wallet: { ...mockWallet, balance: mockWallet.balance + 200 },
            transaction: mockTransaction,
          },
        });
      })
    );

    await walletService.addFunds(200, 'pi_confirmed_abc');

    expect(capturedBody.paymentIntentId).toBe('pi_confirmed_abc');
    expect(capturedBody.amount).toBe(200);
  });

  it('returns updated wallet and transaction on success', async () => {
    const result = await walletService.addFunds(100, 'pi_test_10000');

    expect(result.wallet).toBeDefined();
    expect(result.transaction).toBeDefined();
    expect(result.wallet.balance).toBeGreaterThan(0);
  });

  it('throws when paymentIntentId is missing (backend rejects)', async () => {
    // MSW handler rejects requests without paymentIntentId (see handlers.ts)
    server.use(
      http.post(`${API}/api/v1/wallet/add-funds`, async ({ request }) => {
        const body = await request.json() as any;
        if (!body.paymentIntentId) {
          return HttpResponse.json(
            { message: 'paymentIntentId is required' },
            { status: 400 }
          );
        }
        return HttpResponse.json({ data: { wallet: mockWallet, transaction: mockTransaction } });
      })
    );

    // Calling without paymentIntentId — TypeScript prevents this at compile time,
    // but simulate passing empty string to confirm the backend guard works.
    await expect(walletService.addFunds(100, '')).rejects.toThrow(
      'paymentIntentId is required'
    );
  });

  it('throws on API error', async () => {
    server.use(
      http.post(`${API}/api/v1/wallet/add-funds`, () =>
        HttpResponse.json({ message: 'Insufficient funds' }, { status: 422 })
      )
    );

    await expect(walletService.addFunds(99999, 'pi_test')).rejects.toThrow(
      'Insufficient funds'
    );
  });
});

// ─── withdrawFunds ────────────────────────────────────────────────────────────

describe('walletService.withdrawFunds', () => {
  it('returns updated wallet and transaction on success', async () => {
    const result = await walletService.withdrawFunds(100);

    expect(result.wallet).toBeDefined();
    expect(result.transaction).toBeDefined();
  });

  it('passes the amount in the request body', async () => {
    let capturedBody: any;
    server.use(
      http.post(`${API}/api/v1/wallet/withdraw`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          data: { wallet: mockWallet, transaction: mockTransaction },
        });
      })
    );

    await walletService.withdrawFunds(250);

    expect(capturedBody.amount).toBe(250);
  });

  it('throws when balance is insufficient', async () => {
    server.use(
      http.post(`${API}/api/v1/wallet/withdraw`, () =>
        HttpResponse.json({ message: 'Insufficient balance' }, { status: 422 })
      )
    );

    await expect(walletService.withdrawFunds(1000000)).rejects.toThrow(
      'Insufficient balance'
    );
  });
});
