// config.js
// For development, use localhost if backend is on same machine
// For network access, use your machine's IP address
// Change this based on your setup

// Auto-detect: Use localhost for web, IP for mobile/network
const getApiUrl = () => {
  // Priority 1: Environment variable (if set) - Use this for production
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Priority 2: Check if we're on web (localhost) - Development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return "http://localhost:3000";
  }
  
  // Priority 3: Production - Check if deployed (not localhost)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // In production, use backend Vercel URL as fallback
    // Best practice: Set EXPO_PUBLIC_API_URL in Vercel environment variables
    console.warn('[Config] Production mode detected but EXPO_PUBLIC_API_URL not set. Using fallback backend URL.');
    return "https://backend-brown-theta-94.vercel.app"; // Production backend URL
  }
  
  // Priority 4: Default to localhost (works for most development scenarios)
  return "http://localhost:3000";
};

export const API_BASE_URL = getApiUrl();

// Log the API URL for debugging
if (typeof window !== 'undefined') {
  // console.log('[Config] API_BASE_URL:', API_BASE_URL);
  // console.log('[Config] Backend should be running at:', API_BASE_URL);
}
