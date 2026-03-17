import { API_BASE_URL } from '@/config';
import { storageGet } from '@/utils/storage';

const getAuthToken = async (): Promise<string | null> => {
  return await storageGet('accessToken');
};

export const stripeService = {
  /**
   * Creates a Stripe PaymentIntent on the backend.
   * Returns the clientSecret (to initialize the payment sheet) and paymentIntentId.
   */
  createPaymentIntent: async (
    amount: number,
    currency: string = 'usd'
  ): Promise<{ clientSecret: string; paymentIntentId: string }> => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/v1/stripe/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ amount, currency: currency.toLowerCase() }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment intent');
    }
    return data.data;
  },
};
