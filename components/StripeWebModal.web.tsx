import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Lazily initialised — only call loadStripe (which fires r.stripe.com/b) when
// the modal actually opens for the first time, not on every page load.
let stripePromise: ReturnType<typeof loadStripe> | null = null;

function getStripePromise() {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');
  }
  return stripePromise;
}

// ─── Inner form (must live inside <Elements>) ────────────────────────────────
interface FormProps {
  amount: number;
  currency: string;
  customerName?: string;
  customerEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ amount, currency, customerName, customerEmail, onSuccess, onCancel }: FormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);

    // Validate the form fields first
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? 'Validation failed');
      setPaying(false);
      return;
    }

    // Confirm the PaymentIntent
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required', // only redirect for methods that require it (e.g. 3DS)
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed');
      setPaying(false);
    } else {
      onSuccess();
    }
  };

  return (
    <View style={styles.form}>
      {/* Stripe-hosted card form renders inside this div */}
      {/* @ts-ignore - div is valid JSX in web context */}
      <div style={{ marginBottom: 20 }}>
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                name: customerName || '',
                email: customerEmail || '',
              },
            },
          }}
        />
      </div>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.payBtn, paying && styles.btnDisabled]}
        onPress={handlePay}
        disabled={paying}
        activeOpacity={0.85}
      >
        {paying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payBtnText}>
            Pay {currency.toUpperCase()} {amount.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.cancelBtn, paying && styles.btnDisabled]}
        onPress={onCancel}
        disabled={paying}
        activeOpacity={0.7}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  clientSecret: string;
  amount: number;
  currency: string;
  customerName?: string;
  customerEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeWebModal({
  visible,
  clientSecret,
  amount,
  currency,
  customerName,
  customerEmail,
  onSuccess,
  onCancel,
}: Props) {
  if (!visible || !clientSecret) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Complete Payment</Text>
          <Text style={styles.subtitle}>
            Amount:{' '}
            <Text style={styles.amountText}>
              {currency.toUpperCase()} {amount.toFixed(2)}
            </Text>
          </Text>

          {/* Elements must receive the clientSecret so Stripe knows which PaymentIntent */}
          <Elements
            stripe={getStripePromise()}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#282A32',
                  borderRadius: '8px',
                },
              },
            }}
          >
            <CheckoutForm
              amount={amount}
              currency={currency}
              customerName={customerName}
              customerEmail={customerEmail}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </Elements>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  amountText: {
    fontWeight: '700',
    color: '#1E293B',
  },
  form: {
    width: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '500',
  },
  payBtn: {
    backgroundColor: '#282A32',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  payBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '500',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
