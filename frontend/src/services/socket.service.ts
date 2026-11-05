import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (token: string): Socket => {
  if (socket) {
    socket.disconnect();
  }

  const backendUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

  socket = io(backendUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('⚡ Connected to EduSphere real-time WebSocket:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('WebSocket connection warning:', err.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

