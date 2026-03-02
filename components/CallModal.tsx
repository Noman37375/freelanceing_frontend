/**
 * CallModal – incoming call and active call UI. WebRTC (no paid APIs).
 * On web: shows video/audio; on native: prompts to use web for calls.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCall } from '@/contexts/CallContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';

function VideoView({ stream, style, mirror }: { stream: MediaStream | null; style?: object; mirror?: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (Platform.OS !== 'web' || !ref.current || !stream) return;
    ref.current.srcObject = stream;
  }, [stream]);
  if (Platform.OS !== 'web' || !stream) return <View style={[styles.videoPlaceholder, style]} />;
  return React.createElement('video', {
    ref: ref as any,
    autoPlay: true,
    playsInline: true,
    muted: false,
    style: [styles.webVideo, style, mirror ? { transform: 'scaleX(-1)' } : undefined],
  });
}

export function CallModal() {
  const {
    isWebRTCAvailable,
    incomingCall,
    activeCall,
    callStatus,
    localStream,
    remoteStream,
    acceptCall,
    rejectCall,
    hangup,
  } = useCall();

  const showIncoming = incomingCall != null;
  const showActive = activeCall != null;

  if (!showIncoming && !showActive) return null;

  if (showIncoming) {
    const isVideo = incomingCall!.type === 'video';
    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.incomingCard}>
            <Text style={styles.incomingTitle}>
              Incoming {isVideo ? 'video' : 'audio'} call
            </Text>
            <Text style={styles.incomingName} numberOfLines={1}>
              {incomingCall!.fromUserName || incomingCall!.fromUserId || 'Unknown'}
            </Text>
            {!isWebRTCAvailable && (
              <Text style={styles.webOnlyHint}>
                Calls work in the web app. Open this app in a browser.
              </Text>
            )}
            <View style={styles.incomingActions}>
              <TouchableOpacity
                style={[styles.btn, styles.rejectBtn]}
                onPress={rejectCall}
                activeOpacity={0.8}
              >
                <Feather name="phone-off" size={24} color={COLORS.white} />
                <Text style={styles.btnLabel}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.acceptBtn]}
                onPress={acceptCall}
                activeOpacity={0.8}
                disabled={!isWebRTCAvailable}
              >
                <Feather name={isVideo ? 'video' : 'phone'} size={24} color={COLORS.white} />
                <Text style={styles.btnLabel}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  if (showActive) {
    const isVideo = activeCall!.type === 'video';
    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.activeCard}>
            <Text style={styles.activeTitle}>
              {callStatus === 'connected' ? 'Connected' : 'Connecting...'}
            </Text>
            <Text style={styles.activeName} numberOfLines={1}>
              {activeCall!.remoteUserName || activeCall!.remoteUserId || 'Unknown'}
            </Text>

            {Platform.OS === 'web' && isVideo && (
              <View style={styles.videoContainer}>
                <View style={styles.remoteVideoWrap}>
                  <VideoView stream={remoteStream} style={styles.remoteVideo} />
                </View>
                <View style={styles.localVideoWrap}>
                  <VideoView stream={localStream} style={styles.localVideo} mirror />
                </View>
              </View>
            )}

            {(!isVideo || Platform.OS !== 'web') && (
              <View style={styles.audioOnlyPlaceholder}>
                <Feather name="phone" size={48} color={COLORS.primary} />
                <Text style={styles.audioOnlyText}>Audio call in progress</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.hangupBtn}
              onPress={hangup}
              activeOpacity={0.8}
            >
              <Feather name="phone-off" size={28} color={COLORS.white} />
              <Text style={styles.hangupLabel}>End call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.l,
  },
  incomingCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  incomingTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  incomingName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.m,
  },
  webOnlyHint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.warning,
    marginBottom: SPACING.m,
    textAlign: 'center',
  },
  incomingActions: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  btn: {
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.m,
    alignItems: 'center',
    minWidth: 100,
  },
  rejectBtn: {
    backgroundColor: COLORS.error,
  },
  acceptBtn: {
    backgroundColor: COLORS.success,
  },
  btnLabel: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginTop: SPACING.xs,
  },
  activeCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.l,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  activeTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  activeName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.m,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.m,
    overflow: 'hidden',
    marginBottom: SPACING.m,
    position: 'relative',
  },
  remoteVideoWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  localVideoWrap: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 100,
    height: 75,
    borderRadius: BORDER_RADIUS.s,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  localVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  webVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  videoPlaceholder: {
    backgroundColor: COLORS.surfaceMuted,
  },
  audioOnlyPlaceholder: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.m,
  },
  audioOnlyText: {
    marginTop: SPACING.s,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  hangupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.m,
    gap: SPACING.s,
  },
  hangupLabel: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
});
