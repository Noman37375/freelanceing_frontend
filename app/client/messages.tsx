import React from 'react';
import FeatureUnavailable from '@/components/FeatureUnavailable';

export default function ClientMessagesScreen() {
  return (
    <FeatureUnavailable
      title="Messaging is disabled"
      description="Messaging/Chat is currently disabled until the real backend messaging feature is connected."
      showBackButton
    />
  );
}
