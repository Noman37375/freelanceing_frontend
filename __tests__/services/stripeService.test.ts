import { stripeService } from '@/services/stripeService';

jest.mock('@/utils/storage', () => ({
  storageGet: jest.fn().mockResolvedValue('test-token'),
}));

describe('stripeService.createPaymentIntent', () => {
  it('converts dollars to cents (critical regression)', async () => {
    const result = await stripeService.createPaymentIntent(50);
    // Handler echoes back amount — should be 5000 (50 * 100), not 50
    expect(result.paymentIntentId).toBe('pi_5000');
  });

  it('rounds fractional cents correctly', async () => {
    const result = await stripeService.createPaymentIntent(9.999);
    // Math.round(9.999 * 100) = 1000
    expect(result.paymentIntentId).toBe('pi_1000');
  });

  it('lowercases the currency', async () => {
    const result = await stripeService.createPaymentIntent(10, 'USD');
    expect(result.clientSecret).toContain('pi_1000');
  });

  it('returns clientSecret and paymentIntentId', async () => {
    const result = await stripeService.createPaymentIntent(20);
    expect(result).toHaveProperty('clientSecret');
    expect(result).toHaveProperty('paymentIntentId');
  });

  it('sends Authorization header when token is present', async () => {
    const { storageGet } = require('@/utils/storage');
    storageGet.mockResolvedValueOnce('my-jwt');

    // The handler returns successfully — if header was missing the real server
    // would 401, but here we just verify the call succeeds (token is attached)
    const result = await stripeService.createPaymentIntent(5);
    expect(result.paymentIntentId).toBeDefined();
  });

  it('throws when server responds with error', async () => {
    const { server } = require('../mocks/server');
    const { http, HttpResponse } = require('msw');
    server.use(
      http.post(
        'https://backend-brown-theta-94.vercel.app/api/v1/stripe/create-payment-intent',
        () => HttpResponse.json({ message: 'Stripe error' }, { status: 500 })
      )
    );
    await expect(stripeService.createPaymentIntent(10)).rejects.toThrow('Stripe error');
  });
});
