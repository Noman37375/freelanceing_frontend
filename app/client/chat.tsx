import React from 'react';
import FeatureUnavailable from '@/components/FeatureUnavailable';

export default function ClientChatScreen() {
  return (
    <FeatureUnavailable
      title="Chat is disabled"
      description="Chat is currently disabled until the real backend messaging feature is connected."
      showBackButton
    />
  );
}
