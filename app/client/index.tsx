// app/client/index.tsx
import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Legacy route compatibility.
 * Canonical client entry is `/(client-tabs)`.
 */
export default function ClientIndexRedirect() {
  return <Redirect href={"/(client-tabs)" as any} />;
}
