import React from 'react';

interface Props {
  children: React.ReactNode;
}

// On web, Stripe is initialised inside StripeWebModal via @stripe/react-stripe-js.
// No native StripeProvider needed here.
export default function NativeStripeProvider({ children }: Props) {
  return <>{children}</>;
}
