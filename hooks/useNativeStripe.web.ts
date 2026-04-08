// On web, the native Stripe payment sheet is not used.
// Return no-op stubs so the hook is safe to call unconditionally.
export function useNativeStripe() {
  const initPaymentSheet = async (_options: object) => ({ error: undefined });
  const presentPaymentSheet = async () => ({ error: undefined });
  return { initPaymentSheet, presentPaymentSheet };
}
