import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  participants: {
    id: string;
    user_id: string;
    role: string;
    user: {
      id: string;
      username: string;
      full_name: string;
      avatar_url?: string;
    };
  }[];
  last_message?: Message;
  unread_count?: number;
}

export const useMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchConversations = async () => {
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
  };

  const fetchMessages = async (conversationId: string, limit?: number) => {
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
  };

  const createConversation = async (title: string, participantIds: string[]) => {
    try {
      const newConversation = await api.messages.createConversation({
        participants: participantIds,
        type: 'group',
        name: title,
      });
      const conversationWithId = { ...newConversation, id: newConversation._id };
      setConversations((prev) => [...prev, conversationWithId]);
      return conversationWithId;
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
  };

  const sendMessage = async (conversationId: string, content: string) => {
    try {
      const newMessage = await api.messages.sendMessage(conversationId, { content });
      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      toast({
        title: "Error sending message",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    }
  };

  const markAsRead = async (messageId: string) => {
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
  };

  const deleteMessage = async (messageId: string) => {
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
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

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
  };
};
