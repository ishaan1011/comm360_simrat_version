import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ApiUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

interface ApiMessage {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  type?: string;
}

interface ApiConversation {
  id: string;
  participants: ApiUser[];
  last_message?: ApiMessage;
  unread_count?: number;
}

// Add these interfaces for meeting and message payloads
interface MeetingData {
  [key: string]: unknown;
}
interface MessageData {
  [key: string]: unknown;
}

// Auth API           
export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    localStorage.removeItem('token');
  },
  loginWithGoogle: async (idToken: string) => {
    const response = await api.post('/api/auth/google', { idToken });
    return response.data;
  },
  signUp: async (email: string, password: string, extra?: Record<string, unknown>) => {
    const response = await api.post('/api/auth/signup', { email, password, ...extra });
    return response.data;
  },
};

// Profile API
export const profile = {
  get: async () => {
    const response = await api.get('/api/profile');
    return response.data;
  },
  update: async (data: ApiUser) => {
    const response = await api.put('/api/profile', data);
    return response.data;
  },
  updateSettings: async (settings: Record<string, unknown>) => {
    const response = await api.put('/profile/settings', settings);
    return response.data;
  },
  updateNotifications: async (preferences: Record<string, unknown>) => {
    const response = await api.put('/profile/notifications', preferences);
    return response.data;
  },
  search: async (query: string) => {
    const response = await api.get('/api/profile/search', {
      params: { query },
    });
    return response.data;
  },
};

// Meetings API
export const meetings = {
  create: async (data: MeetingData) => {
    const response = await api.post('/api/meetings', data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/api/meetings');
    return response.data;
  },
  get: async (id: string) => {
    const response = await api.get(`/api/meetings/${id}`);
    return response.data;
  },
  update: async (id: string, data: MeetingData) => {
    const response = await api.put(`/api/meetings/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/meetings/${id}`);
  },
  join: async (id: string) => {
    const response = await api.post(`/api/meetings/${id}/join`);
    return response.data;
  },
  leave: async (id: string) => {
    const response = await api.post(`/api/meetings/${id}/leave`);
    return response.data;
  },
};

// Messages API
export const messages = {
  createConversation: async (data: MessageData) => {
    const response = await api.post('/api/messages/conversations', data);
    return response.data;
  },
  getConversations: async () => {
    const response = await api.get('/api/messages/conversations');
    return response.data;
  },
  getConversation: async (id: string) => {
    const response = await api.get(`/api/messages/conversations/${id}`);
    return response.data;
  },
  sendMessage: async (conversationId: string, data: MessageData) => {
    const response = await api.post(`/api/messages/conversations/${conversationId}/messages`, data);
    return response.data;
  },
  getMessages: async (conversationId: string, limit?: number) => {
    const response = await api.get(`/api/messages/conversations/${conversationId}/messages`, {
      params: { limit },
    });
    return response.data;
  },
  markAsRead: async (messageId: string) => {
    const response = await api.post(`/api/messages/messages/${messageId}/read`);
    return response.data;
  },
  delete: async (messageId: string) => {
    await api.delete(`/api/messages/messages/${messageId}`);
  },
  reactToMessage: async (messageId: string, emoji: string) => {
    const response = await api.patch(`/api/messages/${messageId}/reactions`, { emoji });
    return response.data;
  },
  deleteConversation: async (conversationId: string) => {
    const response = await api.delete(`/api/messages/conversations/${conversationId}`);
    return response.data;
  },
};

export default {
  auth,
  profile,
  meetings,
  messages,
}; 