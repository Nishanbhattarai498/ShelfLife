import { io, Socket } from 'socket.io-client';

// Get the base URL from environment or default. Prefer explicit `EXPO_PUBLIC_API_URL`.
// Strip '/api' because socket.io connects to the root.
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = API_URL.replace('/api', '');

let socket: Socket | null = null;
let currentUserId: string | null = null;
const joinedConversations = new Set<string>();

type NewMessageHandler = (data: any) => void;
type ConversationStartedHandler = (data: any) => void;

const newMessageListeners = new Set<NewMessageHandler>();
const conversationStartedListeners = new Set<ConversationStartedHandler>();

export const addNewMessageListener = (fn: NewMessageHandler) => {
  newMessageListeners.add(fn);
  return () => newMessageListeners.delete(fn);
};

export const addConversationStartedListener = (fn: ConversationStartedHandler) => {
  conversationStartedListeners.add(fn);
  return () => conversationStartedListeners.delete(fn);
};

// Allow the app to notify local listeners for messages generated locally
// (e.g., after a successful POST) so the inbox/chat update immediately
export const notifyLocalNewMessage = (data: any) => {
  for (const fn of Array.from(newMessageListeners)) {
    try { fn(data); } catch (e) { console.error('notifyLocalNewMessage listener error', e); }
  }
};

export const notifyLocalConversationStarted = (data: any) => {
  for (const fn of Array.from(conversationStartedListeners)) {
    try { fn(data); } catch (e) { console.error('notifyLocalConversationStarted listener error', e); }
  }
};

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      // Allow polling fallback when native websocket transport isn't available
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    
    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
      if (currentUserId) {
        console.log('Re-joining room for user:', currentUserId);
        // use acknowledgement so server confirms join
        socket?.emit('join_user', currentUserId, (ack: any) => {
          console.log('join_user ack:', ack);
        });
        // re-join any conversations we previously joined
        for (const convId of Array.from(joinedConversations)) {
          socket?.emit('join_conversation', convId, (ack: any) => {
            console.log('re-join_conversation ack for', convId, ack);
          });
        }
      }
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
    
    socket.on('connect_error', (err) => {
      console.log('Socket connection error:', err);
    });

    // Forward important events to any registered listeners so app-level
    // components can react even when they don't attach direct socket handlers.
    socket.on('new_message', (data: any) => {
      for (const fn of Array.from(newMessageListeners)) {
        try { fn(data); } catch (e) { console.error('newMessage listener error', e); }
      }
    });

    socket.on('conversation_started', (data: any) => {
      for (const fn of Array.from(conversationStartedListeners)) {
        try { fn(data); } catch (e) { console.error('conversationStarted listener error', e); }
      }
    });
  }
  return socket;
};

export const connectSocket = (userId: string) => {
  currentUserId = userId;
  const s = getSocket();
  
  if (!s.connected) {
    console.log('Connecting socket...');
    s.connect();
    // once connected, server join will be handled in 'connect' handler
  } else {
    console.log('Socket already connected, joining room for:', userId);
    s.emit('join_user', userId, (ack: any) => {
      console.log('join_user ack (already connected):', ack);
    });
  }
  
  return s;
};

export const joinConversation = (conversationId: string) => {
  joinedConversations.add(conversationId);
  const s = getSocket();
  if (s.connected) {
    s.emit('join_conversation', conversationId, (ack: any) => {
      console.log('join_conversation ack:', conversationId, ack);
    });
  } else {
    // will join on connect handler
    console.log('Will join conversation on next connect:', conversationId);
  }
};

export const leaveConversation = (conversationId: string) => {
  joinedConversations.delete(conversationId);
  const s = getSocket();
  if (s.connected) {
    s.emit('leave_conversation', conversationId, (ack: any) => {
      console.log('leave_conversation ack:', conversationId, ack);
    });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
