import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Legacy route compatibility.
 * Canonical client projects screen is `/(client-tabs)/projects`.
 */
export default function ClientProjectsRedirect() {
  return <Redirect href={"/(client-tabs)/projects" as any} />;
}