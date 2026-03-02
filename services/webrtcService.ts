/**
 * WebRTC call service – real-time audio/video using browser APIs (no paid APIs).
 * Works when app runs on web (browser). For native, use react-native-webrtc in a dev build.
 */

import { Platform } from 'react-native';

const STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export type CallType = 'audio' | 'video';

function isWebRTCSupported(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof window === 'undefined') return false;
  return !!(window.RTCPeerConnection && navigator?.mediaDevices?.getUserMedia);
}

/**
 * Get user media (camera + mic or mic only). Web only.
 */
export async function getLocalStream(video: boolean): Promise<MediaStream> {
  if (!isWebRTCSupported()) {
    throw new Error('WebRTC is only supported in the browser. Open the app on web for calls.');
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: video ? { facingMode: 'user' } : false,
  });
  return stream;
}

/**
 * Create a new RTCPeerConnection with free STUN. Web only.
 */
export function createPeerConnection(
  onIceCandidate: (candidate: RTCIceCandidate) => void,
  onTrack: (event: RTCTrackEvent) => void
): RTCPeerConnection {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    throw new Error('RTCPeerConnection is only available on web.');
  }
  const pc = new window.RTCPeerConnection({
    iceServers: STUN_SERVERS,
  });
  pc.onicecandidate = (e) => {
    if (e.candidate) onIceCandidate(e.candidate);
  };
  pc.ontrack = onTrack;
  return pc;
}

export function isWebRTCAvailable(): boolean {
  return isWebRTCSupported();
}
