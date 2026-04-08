import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

interface Props {
  children: React.ReactNode;
}

export default function NativeStripeProvider({ children }: Props) {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''}
      urlScheme="myapp"
    >
      {children}
    </StripeProvider>
  );
}
