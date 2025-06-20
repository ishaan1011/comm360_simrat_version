import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
}

interface Message {
  id?: string;
  tempId?: string;
  conversation?: string;
  conversation_id?: string;
  sender?: string;
  sender_id?: string;
  content: string;
  createdAt?: string;
  created_at?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  senderObj?: User;
  readBy?: string[];
  type?: string;
}

interface TypingIndicator {
  user_id: string;
  conversation_id: string;
  timestamp: number;
}

interface Conversation {
  _id: string;
  title?: string;
  type?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number;
}

export const useRealTimeMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [outbox, setOutbox] = useState<Message[]>(() => {
    const saved = localStorage.getItem('messageOutbox');
    return saved ? JSON.parse(saved) : [];
  });
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.messages.getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch conversations');
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string, limit?: number) => {
    try {
      setLoading(true);
      const data = await api.messages.getMessages(conversationId, limit);
      setMessages(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(async (participantIds: string[], name?: string, type?: string) => {
    try {
      console.log('Creating conversation with:', { participantIds, name, type });
      const newConversation = await api.messages.createConversation({
        participants: participantIds,
        type: type || 'direct',
        name,
      });
      console.log('New conversation created:', newConversation);
      
      // Always fetch the latest conversations from the backend for correct order and data
      await fetchConversations();
      
      return newConversation._id;
    } catch (err) {
      setError('Failed to create conversation');
      console.error('Error creating conversation:', err);
      toast({
        title: "Error creating conversation",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    }
  }, [toast, fetchConversations]);

  // Connect to WebSocket on mount
  useEffect(() => {
    if (!user) return;
    if (!socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_API_URL, {
        auth: { token: localStorage.getItem('token') },
        transports: ['websocket']
      });
    }
    const socket = socketRef.current;
    // Handle incoming events
    socket.on('message_sent', (msg) => {
      setMessages((prev) => prev.map(m => m.tempId && m.tempId === msg.tempId ? { ...msg, status: 'sent' as const } : m));
    });
    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, { ...msg, status: 'delivered' as const }]);
    });
    socket.on('message_failed', (data) => {
      setMessages((prev) => prev.map(m => m.tempId && m.tempId === data.tempId ? { ...m, status: 'failed' as const } : m));
      toast({ title: 'Message failed', description: data.error, variant: 'destructive' });
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Join/leave conversation room on open/close
  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('join_conversation', conversationId);
  }, []);
  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('leave_conversation', conversationId);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache conversations and messages in localStorage
  useEffect(() => {
    localStorage.setItem('cachedConversations', JSON.stringify(conversations));
  }, [conversations]);
  useEffect(() => {
    localStorage.setItem('cachedMessages', JSON.stringify(messages));
  }, [messages]);

  // On mount, load cached data if offline
  useEffect(() => {
    if (isOffline) {
      const cachedConvs = localStorage.getItem('cachedConversations');
      if (cachedConvs) setConversations(JSON.parse(cachedConvs));
      const cachedMsgs = localStorage.getItem('cachedMessages');
      if (cachedMsgs) setMessages(JSON.parse(cachedMsgs));
    }
  }, [isOffline]);

  // Queue outgoing messages if offline
  const sendMessage = useCallback((conversationId: string, content: string) => {
    if (isOffline) {
      const tempId = Math.random().toString(36).substr(2, 9);
      const queuedMsg = {
        tempId,
        conversation: conversationId,
        sender: user?.id,
        content,
        createdAt: new Date().toISOString(),
        status: 'sending' as const
      };
      setMessages((prev) => [...prev, queuedMsg]);
      setOutbox((prev) => {
        const updated = [...prev, queuedMsg];
        localStorage.setItem('messageOutbox', JSON.stringify(updated));
        return updated;
      });
      return;
    }
    const tempId = Math.random().toString(36).substr(2, 9);
    const newMsg = {
      tempId,
      conversation: conversationId,
      sender: user?.id,
      content,
      createdAt: new Date().toISOString(),
      status: 'sending' as const
    };
    setMessages((prev) => [...prev, newMsg]);
    socketRef.current?.emit('send_message', { conversationId, content, tempId });
  }, [user, isOffline]);

  // Retry sending queued messages on reconnect
  useEffect(() => {
    if (!isOffline && outbox.length > 0 && socketRef.current) {
      outbox.forEach(msg => {
        socketRef.current?.emit('send_message', { conversationId: msg.conversation, content: msg.content, tempId: msg.tempId });
      });
      setOutbox([]);
      localStorage.removeItem('messageOutbox');
    }
  }, [isOffline, outbox]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await api.messages.markAsRead(messageId);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, read: true } : message
        )
      );
    } catch (err) {
      setError('Failed to mark message as read');
      console.error('Error marking message as read:', err);
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await api.messages.delete(messageId);
      setMessages((prev) => prev.filter((message) => message.id !== messageId));
    } catch (err) {
      setError('Failed to delete message');
      console.error('Error deleting message:', err);
      toast({
        title: "Error deleting message",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  // Mark messages as read when chat is focused/visible
  const markMessagesAsRead = useCallback((conversationId: string, messageIds: string[]) => {
    if (socketRef.current && messageIds.length > 0) {
      messageIds.forEach(messageId => {
        socketRef.current?.emit('mark_as_read', { messageId, conversationId });
      });
    }
  }, []);

  // Listen for 'message_read' events
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    const handler = (data: { messageId: string; userId: string }) => {
      setMessages((prev) => prev.map(m => m.id === data.messageId ? { ...m, readBy: [...(m.readBy || []), data.userId] } : m));
    };
    socket.on('message_read', handler);
    return () => { socket.off('message_read', handler); };
  }, []);

  // Helper to get read/delivered status
  const getMessageStatus = useCallback((msg: Message, currentUserId: string, participants: User[]) => {
    if (msg.status === 'failed') return 'Failed';
    if (msg.status === 'sending') return 'Sending';
    if (msg.readBy && msg.readBy.length === participants.length) return 'Read';
    if (msg.readBy && msg.readBy.includes(currentUserId)) return 'Delivered';
    return 'Sent';
  }, []);

  // Send typing event
  const sendTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing', { conversationId });
  }, []);

  // Listen for typing events
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    const handler = (data: { userId: string; conversationId: string }) => {
      setTypingIndicators((prev) => {
        // Add or update typing indicator for this user/conversation
        const filtered = prev.filter(t => t.user_id !== data.userId || t.conversation_id !== data.conversationId);
        return [...filtered, { user_id: data.userId, conversation_id: data.conversationId, timestamp: Date.now() }];
      });
    };
    socket.on('typing', handler);
    return () => { socket.off('typing', handler); };
  }, []);

  // Remove typing indicators after a timeout
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingIndicators((prev) => prev.filter(t => Date.now() - t.timestamp < 3000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for presence events
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    const handler = (data: { userId: string; status: string }) => {
      setOnlineUsers((prev) => {
        if (data.status === 'online') return Array.from(new Set([...prev, data.userId]));
        if (data.status === 'offline') return prev.filter(id => id !== data.userId);
        return prev;
      });
    };
    socket.on('presence', handler);
    return () => { socket.off('presence', handler); };
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await api.messages.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((conv) => conv._id !== conversationId));
      if (currentConversation && currentConversation._id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      toast({ title: 'Conversation deleted', description: 'The conversation and its messages were deleted.' });
    } catch (err) {
      setError('Failed to delete conversation');
      console.error('Error deleting conversation:', err);
      toast({
        title: 'Error deleting conversation',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast, currentConversation]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    createConversation,
    sendMessage,
    markAsRead,
    deleteMessage,
    setCurrentConversation,
    joinConversation,
    leaveConversation,
    isOffline,
    markMessagesAsRead,
    getMessageStatus,
    sendTyping,
    typingIndicators,
    onlineUsers,
    deleteConversation,
  };
};
