// Web stub for @stripe/stripe-react-native
// This module is native-only; on web we provide no-op replacements.
const React = require('react');

const StripeProvider = ({ children }) => children ?? null;

const useStripe = () => ({
  initPaymentSheet: async () => ({ error: new Error('Stripe is not supported on web') }),
  presentPaymentSheet: async () => ({ error: new Error('Stripe is not supported on web') }),
  confirmPayment: async () => ({ error: new Error('Stripe is not supported on web') }),
  createPaymentMethod: async () => ({ error: new Error('Stripe is not supported on web') }),
  handleNextAction: async () => ({ error: new Error('Stripe is not supported on web') }),
  retrievePaymentIntent: async () => ({ error: new Error('Stripe is not supported on web') }),
});

module.exports = {
  StripeProvider,
  useStripe,
};
