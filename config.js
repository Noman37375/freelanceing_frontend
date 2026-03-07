// config.js
const getApiUrl = () => {
  // Priority 1: Environment variable — always use this in production/APK builds
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Priority 2: Web browser (window.location exists only in real browsers)
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    if (window.location.hostname === 'localhost') {
      return "http://localhost:3000";
    }
    return "https://backend-brown-theta-94.vercel.app";
  }

  // Priority 3: Native (React Native — no window.location)
  return "https://backend-brown-theta-94.vercel.app";
};

export const API_BASE_URL = getApiUrl();
