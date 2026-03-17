// Native stub — payment handled by stripe-react-native's presentPaymentSheet
export default function StripeWebModal(_props: {
  visible: boolean;
  clientSecret: string;
  amount: number;
  currency: string;
  customerName?: string;
  customerEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  return null;
}
