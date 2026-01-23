import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Legacy route compatibility.
 * Canonical client freelancers screen is `/(client-tabs)/freelancers`.
 */
export default function ClientFreelancersRedirect() {
  return <Redirect href={"/(client-tabs)/freelancers" as any} />;
}
