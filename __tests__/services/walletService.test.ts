import { walletService } from '@/services/walletService';

jest.mock('@/utils/storage', () => ({
  storageGet: jest.fn().mockResolvedValue('test-token'),
}));

describe('walletService.getWallet', () => {
  it('returns wallet with correct shape', async () => {
    const wallet = await walletService.getWallet();
    expect(wallet).toHaveProperty('id', 'wallet-1');
    expect(wallet).toHaveProperty('balance');
    expect(wallet).toHaveProperty('escrowBalance');
    expect(wallet).toHaveProperty('total');
  });
});

describe('walletService.getTransactions', () => {
  it('returns an array of transactions', async () => {
    const transactions = await walletService.getTransactions();
    expect(Array.isArray(transactions)).toBe(true);
    expect(transactions[0]).toHaveProperty('id', 'txn-1');
  });

  it('passes limit as query param', async () => {
    let capturedUrl = '';
    const { server } = require('../mocks/server');
    const { http, HttpResponse } = require('msw');
    server.use(
      http.get(
        'https://backend-brown-theta-94.vercel.app/api/v1/wallet/transactions',
        ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ data: { transactions: [] } });
        }
      )
    );
    await walletService.getTransactions(5);
    expect(capturedUrl).toContain('limit=5');
  });

  it('returns empty array when transactions is missing', async () => {
    const { server } = require('../mocks/server');
    const { http, HttpResponse } = require('msw');
    server.use(
      http.get(
        'https://backend-brown-theta-94.vercel.app/api/v1/wallet/transactions',
        () => HttpResponse.json({ data: {} })
      )
    );
    const result = await walletService.getTransactions();
    expect(result).toEqual([]);
  });
});

describe('walletService.addFunds', () => {
  it('adds funds and returns updated wallet and transaction', async () => {
    const result = await walletService.addFunds(200, 'pi_test123');
    expect(result).toHaveProperty('wallet');
    expect(result).toHaveProperty('transaction');
    expect(result.wallet.balance).toBeGreaterThan(1000);
  });

  it('throws when paymentIntentId is missing', async () => {
    await expect(
      // Simulate a call without paymentIntentId by posting without it via override
      (async () => {
        const { server } = require('../mocks/server');
        const { http, HttpResponse } = require('msw');
        server.use(
          http.post(
            'https://backend-brown-theta-94.vercel.app/api/v1/wallet/add-funds',
            () => HttpResponse.json({ message: 'paymentIntentId is required' }, { status: 400 })
          )
        );
        return walletService.addFunds(100, '');
      })()
    ).rejects.toThrow('paymentIntentId is required');
  });
});

describe('walletService.withdrawFunds', () => {
  it('withdraws funds and returns updated wallet', async () => {
    const result = await walletService.withdrawFunds(50);
    expect(result).toHaveProperty('wallet');
    expect(result).toHaveProperty('transaction');
    expect(result.wallet.balance).toBeLessThan(1000);
  });
});
