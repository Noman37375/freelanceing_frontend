/**
 * CallContext – real-time audio/video calls via WebRTC + Socket.IO signaling (no paid APIs).
 * Works on web (browser). On native, startCall/accept show a message that calls are on web.
 */

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  getLocalStream,
  createPeerConnection,
  isWebRTCAvailable,
  type CallType,
} from '@/services/webrtcService';

export interface IncomingCall {
  fromUserId: string;
  type: CallType;
  fromUserName?: string | null;
}

export interface ActiveCall {
  remoteUserId: string;
  type: CallType;
  remoteUserName?: string | null;
  isInitiator: boolean;
}

type CallStatus = 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected';

interface CallContextType {
  isWebRTCAvailable: boolean;
  incomingCall: IncomingCall | null;
  activeCall: ActiveCall | null;
  callStatus: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (remoteUserId: string, type: CallType, remoteUserName?: string | null) => void;
  acceptCall: () => void;
  rejectCall: () => void;
  hangup: () => void;
}

const CallContext = createContext<CallContextType>({
  isWebRTCAvailable: false,
  incomingCall: null,
  activeCall: null,
  callStatus: 'idle',
  localStream: null,
  remoteStream: null,
  startCall: () => {},
  acceptCall: () => {},
  rejectCall: () => {},
  hangup: () => {},
});

function stopStream(stream: MediaStream | null) {
  if (!stream) return;
  stream.getTracks().forEach((t) => t.stop());
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [localStream, setLocalStreamState] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStreamState] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteUserIdRef = useRef<string | null>(null);
  const isInitiatorRef = useRef(false);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    remoteUserIdRef.current = null;
    pendingIceRef.current = [];
    stopStream(localStream);
    stopStream(remoteStream);
    setLocalStreamState(null);
    setRemoteStreamState(null);
    setActiveCall(null);
    setCallStatus('idle');
    if (socket) {
      socket.off('call:ice');
      socket.off('call:hangup');
    }
  }, [localStream, remoteStream, socket]);

  const hangup = useCallback(() => {
    const toUserId = remoteUserIdRef.current;
    if (socket && toUserId) {
      socket.emit('call:hangup', { toUserId });
    }
    setIncomingCall(null);
    cleanup();
  }, [socket, cleanup]);

  const startCall = useCallback(
    async (remoteUserId: string, type: CallType, remoteUserName?: string | null) => {
      if (!socket || !user?.id || !connected) return;
      if (!isWebRTCAvailable()) {
        return; // UI can show "Calls available on web"
      }
      const to = String(remoteUserId).trim().toLowerCase();
      remoteUserIdRef.current = to;
      isInitiatorRef.current = true;
      setCallStatus('calling');
      socket.emit('call:invite', {
        toUserId: to,
        type,
        fromUserName: user.userName || null,
      });

      try {
        const stream = await getLocalStream(type === 'video');
        setLocalStreamState(stream);
        const pc = createPeerConnection(
          (candidate) => {
            if (socket && to) socket.emit('call:ice', { toUserId: to, candidate: candidate.toJSON() });
          },
          (e) => {
            if (e.streams?.[0]) setRemoteStreamState(e.streams[0]);
          }
        );
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        pcRef.current = pc;

        const listenOnce = (ev: string, fn: (data: any) => void) => {
          const handler = (data: any) => {
            socket.off(ev, handler);
            fn(data);
          };
          socket.on(ev, handler);
        };

        listenOnce('call:accepted', async ({ fromUserId }: { fromUserId: string }) => {
          if (fromUserId !== to) return;
          setCallStatus('connecting');
          setActiveCall({
            remoteUserId: to,
            type,
            remoteUserName: remoteUserName ?? null,
            isInitiator: true,
          });
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('call:offer', { toUserId: to, sdp: offer });
        });

        listenOnce('call:rejected', () => {
          setCallStatus('idle');
          cleanup();
        });

        listenOnce('call:answer', async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
          if (!sdp) return;
          await pc.setRemoteDescription(new (window as any).RTCSessionDescription(sdp));
          pendingIceRef.current.forEach((c) => pc.addIceCandidate(new (window as any).RTCIceCandidate(c)));
          pendingIceRef.current = [];
          setCallStatus('connected');
        });

        socket.on('call:ice', ({ fromUserId, candidate }: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
          if (fromUserId !== to) return;
          if (pc.remoteDescription) {
            pc.addIceCandidate(new (window as any).RTCIceCandidate(candidate)).catch(() => {});
          } else {
            pendingIceRef.current.push(candidate);
          }
        });

        socket.on('call:hangup', ({ fromUserId }: { fromUserId: string }) => {
          if (fromUserId === to) hangup();
        });
      } catch (err) {
        console.error('Start call failed', err);
        setCallStatus('idle');
        remoteUserIdRef.current = null;
      }
    },
    [socket, user?.id, user?.userName, connected, cleanup, hangup]
  );

  const acceptCall = useCallback(async () => {
    const inc = incomingCall;
    if (!inc || !socket || !user?.id) return;
    setIncomingCall(null);
    const from = String(inc.fromUserId).trim().toLowerCase();
    remoteUserIdRef.current = from;
    isInitiatorRef.current = false;
    setCallStatus('connecting');
    socket.emit('call:accept', { toUserId: from });

    if (!isWebRTCAvailable()) {
      setCallStatus('idle');
      return;
    }

    try {
      const stream = await getLocalStream(inc.type === 'video');
      setLocalStreamState(stream);
      const pc = createPeerConnection(
        (candidate) => {
          if (socket && from) socket.emit('call:ice', { toUserId: from, candidate: candidate.toJSON() });
        },
        (e) => {
          if (e.streams?.[0]) setRemoteStreamState(e.streams[0]);
        }
      );
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      pcRef.current = pc;
      setActiveCall({
        remoteUserId: from,
        type: inc.type,
        remoteUserName: inc.fromUserName ?? null,
        isInitiator: false,
      });

      socket.once('call:offer', async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
        if (!sdp) return;
        await pc.setRemoteDescription(new (window as any).RTCSessionDescription(sdp));
        pendingIceRef.current.forEach((c) => pc.addIceCandidate(new (window as any).RTCIceCandidate(c)));
        pendingIceRef.current = [];
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('call:answer', { toUserId: from, sdp: answer });
        setCallStatus('connected');
      });

      socket.on('call:ice', ({ fromUserId, candidate }: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
        if (fromUserId !== from) return;
        if (pc.remoteDescription) {
          pc.addIceCandidate(new (window as any).RTCIceCandidate(candidate)).catch(() => {});
        } else {
          pendingIceRef.current.push(candidate);
        }
      });

      socket.on('call:hangup', ({ fromUserId }: { fromUserId: string }) => {
        if (fromUserId === from) hangup();
      });
    } catch (err) {
      console.error('Accept call failed', err);
      setCallStatus('idle');
      socket.emit('call:reject', { toUserId: from });
    }
  }, [incomingCall, socket, user?.id, hangup]);

  const rejectCall = useCallback(() => {
    const inc = incomingCall;
    if (!inc || !socket) return;
    socket.emit('call:reject', { toUserId: String(inc.fromUserId).trim().toLowerCase() });
    setIncomingCall(null);
  }, [incomingCall, socket]);

  React.useEffect(() => {
    if (!socket || !user?.id) return;
    const onIncoming = (data: { fromUserId: string; type: CallType; fromUserName?: string | null }) => {
      setIncomingCall({
        fromUserId: data.fromUserId,
        type: data.type || 'video',
        fromUserName: data.fromUserName ?? null,
      });
    };
    socket.on('call:incoming', onIncoming);
    return () => {
      socket.off('call:incoming', onIncoming);
    };
  }, [socket, user?.id]);

  const value: CallContextType = {
    isWebRTCAvailable: isWebRTCAvailable(),
    incomingCall,
    activeCall,
    callStatus,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    hangup,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall() {
  return useContext(CallContext);
}
