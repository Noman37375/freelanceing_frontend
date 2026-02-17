/**
 * SocketContext - Single Socket.io connection for real-time chat.
 * Connects when user is logged in; disconnects on logout.
 * Components can use socket to emit (join_room, send_message) and listen (new_message).
 * Tracks online users for presence (green dot in Messages list).
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/config';
import { storageGet } from '@/utils/storage';
import { useAuth } from '@/contexts/AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  onlineUserIds: Set<string>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  onlineUserIds: new Set(),
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      setOnlineUserIds(new Set());
      return;
    }

    let s: Socket | null = null;

    const connect = async () => {
      const token = await storageGet('accessToken');
      if (!token) return;

      const userId = user?.id != null ? String(user.id).trim() : '';
      s = io(API_BASE_URL, {
        auth: { token },
        query: { userId },
        transports: ['websocket', 'polling'],
      });

      s.on('connect', () => setConnected(true));
      s.on('disconnect', () => setConnected(false));
      s.on('connect_error', () => setConnected(false));

      s.on('getOnlineUser', (userIds: string[]) => {
        setOnlineUserIds(new Set(Array.isArray(userIds) ? userIds : []));
      });
      s.on('user_online', (payload: { userId?: string }) => {
        if (payload?.userId) {
          setOnlineUserIds((prev) => new Set(prev).add(payload.userId));
        }
      });
      s.on('user_offline', (payload: { userId?: string }) => {
        if (payload?.userId) {
          setOnlineUserIds((prev) => {
            const next = new Set(prev);
            next.delete(payload.userId!);
            return next;
          });
        }
      });

      setSocket(s);
    };

    connect();

    return () => {
      if (s) {
        s.disconnect();
        setSocket(null);
        setConnected(false);
      }
      setOnlineUserIds(new Set());
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, connected, onlineUserIds }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
