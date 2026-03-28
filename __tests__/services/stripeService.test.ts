/**
 * stripeService.test.ts
 *
 * Key regression: the original code sent amount in dollars (e.g. 50) to Stripe
 * instead of cents (5000). Stripe's minimum charge is $0.50, so $50 sent as 50
 * was rejected. The fix multiplies by 100 with Math.round().
 *
 * These tests lock in the correct cents conversion so it cannot regress.
 */

import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { stripeService } from '@/services/stripeService';

// Mock the storage module so getAuthToken returns a test token
jest.mock('@/utils/storage', () => ({
  storageGet: jest.fn().mockResolvedValue('test-token'),
}));

const API = 'https://backend-brown-theta-94.vercel.app';

// ─── createPaymentIntent ──────────────────────────────────────────────────────

describe('stripeService.createPaymentIntent', () => {
  it('converts dollar amount to cents before sending to the API', async () => {
    let capturedBody: any;

    server.use(
      http.post(`${API}/api/v1/stripe/create-payment-intent`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          data: { clientSecret: 'pi_test_secret', paymentIntentId: 'pi_test_123' },
        });
      })
    );

    await stripeService.createPaymentIntent(50, 'usd');

    // $50 must be sent as 5000 cents — the original bug sent it as 50
    expect(capturedBody.amount).toBe(5000);
  });

  it('rounds fractional dollar amounts to the nearest cent', async () => {
    let capturedBody: any;

    server.use(
      http.post(`${API}/api/v1/stripe/create-payment-intent`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          data: { clientSecret: 'pi_test_secret', paymentIntentId: 'pi_test_999' },
        });
      })
    );

    await stripeService.createPaymentIntent(9.999, 'usd');

    // Math.round(9.999 * 100) = 1000
    expect(capturedBody.amount).toBe(1000);
  });

  it('lowercases the currency code', async () => {
    let capturedBody: any;

    server.use(
      http.post(`${API}/api/v1/stripe/create-payment-intent`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          data: { clientSecret: 'pi_test_secret', paymentIntentId: 'pi_test_usd' },
        });
      })
    );

    await stripeService.createPaymentIntent(100, 'USD');

    expect(capturedBody.currency).toBe('usd');
  });

  it('includes receiptEmail when provided', async () => {
    let capturedBody: any;

    server.use(
      http.post(`${API}/api/v1/stripe/create-payment-intent`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({
          data: { clientSecret: 'pi_test_secret', paymentIntentId: 'pi_test_email' },
        });
      })
    );

    await stripeService.createPaymentIntent(25, 'usd', 'user@example.com');

    expect(capturedBody.receiptEmail).toBe('user@example.com');
  });

  it('returns clientSecret and paymentIntentId from the API response', async () => {
    const result = await stripeService.createPaymentIntent(100, 'usd');

    // Handler in handlers.ts returns pi_test_<amount-in-cents>
    expect(result.clientSecret).toBeDefined();
    expect(result.paymentIntentId).toBeDefined();
  });

  it('throws when the API returns an error response', async () => {
    server.use(
      http.post(`${API}/api/v1/stripe/create-payment-intent`, () =>
        HttpResponse.json({ message: 'Invalid amount' }, { status: 400 })
      )
    );

    await expect(stripeService.createPaymentIntent(0, 'usd')).rejects.toThrow('Invalid amount');
  });

  it('attaches Authorization header when a token exists', async () => {
    let capturedHeaders: Record<string, string> = {};

    server.use(
      http.post(`${API}/api/v1/stripe/create-payment-intent`, ({ request }) => {
        request.headers.forEach((value, key) => {
          capturedHeaders[key.toLowerCase()] = value;
        });
        return HttpResponse.json({
          data: { clientSecret: 'pi_secret', paymentIntentId: 'pi_abc' },
        });
      })
    );

    await stripeService.createPaymentIntent(50, 'usd');

    expect(capturedHeaders['authorization']).toBe('Bearer test-token');
  });
});
