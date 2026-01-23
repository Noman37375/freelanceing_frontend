import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Legacy route compatibility.
 * Canonical client home is `/(client-tabs)`.
 */
export default function ClientHomeRedirect() {
  return <Redirect href={"/(client-tabs)" as any} />;
}
