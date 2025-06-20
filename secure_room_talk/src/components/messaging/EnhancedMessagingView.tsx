import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Plus, 
  Users, 
  Search,
  MoreVertical,
  Phone,
  Video,
  Pin,
  Trash2
} from 'lucide-react';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { EnhancedChatWindow } from './EnhancedChatWindow';
import { CreateConversationDialog } from './CreateConversationDialog';

interface FlatUser {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
}

interface NestedUser {
  id: string;
  user_id?: string;
  role?: string;
  user: FlatUser;
}

type Participant = FlatUser | NestedUser;

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

interface EnhancedMessagingViewProps {
  currentUser: User;
}

export const EnhancedMessagingView = ({ currentUser }: EnhancedMessagingViewProps) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const {
    conversations,
    messages,
    loading,
    sendMessage,
    fetchMessages,
    createConversation,
    deleteConversation
  } = useRealTimeMessages();

  // Add missing properties that the component expects
  const typingIndicators: TypingIndicator[] = [];
  const onlineUsers: string[] = [];

  const selectedConversation = conversations?.find(c => c._id === selectedConversationId);
  const conversationMessages = selectedConversationId ? messages || [] : [];

  const getParticipantName = (p: Participant) => (p as FlatUser).full_name || (p as FlatUser).username || (p as NestedUser).user?.full_name || (p as NestedUser).user?.username || '';
  const getParticipantAvatar = (p: Participant) => (p as FlatUser).avatar_url || (p as NestedUser).user?.avatar_url || '';
  const getParticipantId = (p: Participant) => (p as FlatUser).id || (p as NestedUser).user_id || (p as NestedUser).user?.id || '';

  // Helper to get conversation title: for direct, show other participant's name; for group, show title
  const getConversationTitle = (conv: Conversation): string => {
    if (conv.type === 'group' && conv.title) return conv.title;
    if (conv.participants?.length === 2) {
      const other = conv.participants.find(p => getParticipantId(p) !== currentUser.id);
      return (getParticipantName(other!) || '');
    }
    return conv.title || '';
  };

  // Adapter to convert hook conversation to EnhancedChatWindow conversation
  const adaptedConversation = selectedConversation ? {
    id: selectedConversation._id,
    name: getConversationTitle(selectedConversation),
    type: selectedConversation.type || 'direct',
    participants: selectedConversation.participants.map((p: any) => {
      if (typeof p === 'object' && 'user' in p && p.user) {
        // NestedUser
        return {
          id: p.user.id,
          username: p.user.username,
          full_name: p.user.full_name,
          avatar_url: p.user.avatar_url
        };
      } else {
        // FlatUser
        return {
          id: p.id,
          username: p.username,
          full_name: p.full_name,
          avatar_url: p.avatar_url
        };
      }
    })
  } : null;

  // Helper to safely get sender username for a message
  const getSenderUsername = (sender: unknown): string => {
    if (sender && typeof sender === 'object' && 'username' in (sender as any) && (sender as any).username) {
      return (sender as any).username;
    }
    return '';
  };

  // Ensure conversations is always an array and add null checks
  const safeConversations = conversations || [];
  const filteredConversations = safeConversations.filter(conv => {
    const titleOrName = getConversationTitle(conv);
    const titleMatch = (titleOrName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const participantMatch = conv.participants?.some(p => {
      const participantName = getParticipantName(p) || '';
      return participantName.toLowerCase().includes(searchQuery.toLowerCase());
    }) || false;
    return titleMatch || participantMatch;
  });

  // Calculate total unread count
  const totalUnread = safeConversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    if (!conversationId) {
      console.error('conversationId is undefined or null');
      return;
    }
    
    setSelectedConversationId(conversationId);
    fetchMessages(conversationId);
  };

  const handleCreateConversation = async (
    participantIds: string[] = [],
    name?: string,
    type?: string,
    conversationId?: string
  ) => {
    // If conversationId is provided, just select it
    if (conversationId) {
      setSelectedConversationId(conversationId);
      return;
    }
    // Otherwise, create and select
    const newId = await createConversation(participantIds, name, type);
    if (newId) {
      setSelectedConversationId(newId);
    }
  };

  useEffect(() => {
    console.log('Conversations changed:', conversations);
    console.log('Filtered conversations:', filteredConversations);
  }, [conversations, filteredConversations]);

  // Add error boundary for debugging
  if (!currentUser) {
    return (
      <div className="h-full bg-slate-900 flex items-center justify-center">
        <div className="text-white">User not authenticated</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900 flex">
      {/* Conversation List */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              Messages
              {totalUnread > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {totalUnread}
                </span>
              )}
            </h2>
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No conversations found</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              // Skip conversations without a valid ID
              if (!conversation._id) {
                console.error('Conversation missing ID:', conversation);
                return null;
              }
              
              const otherParticipant = conversation.participants?.find(p => getParticipantId(p) !== currentUser.id);

              const isOnline = otherParticipant ? onlineUsers?.includes(getParticipantId(otherParticipant)) : false;

              return (
                <div
                  key={conversation._id}
                  className={`p-4 border-b border-slate-700 flex items-center justify-between group ${
                    selectedConversationId === conversation._id ? 'bg-slate-700' : 'hover:bg-slate-750'
                  }`}
                >
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleConversationSelect(conversation._id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {otherParticipant ? (
                          <>
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={getParticipantAvatar(otherParticipant)} />
                              <AvatarFallback>
                                {getParticipantName(otherParticipant).charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {isOnline && (
                              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                            )}
                          </>
                        ) : (
                          <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                        )}
                        
                        {conversation.unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white truncate">
                            {getConversationTitle(conversation)}
                          </h3>
                          {conversation.lastMessage && (
                            <span className="text-xs text-slate-400">
                              {formatTime(conversation.lastMessage.created_at)}
                            </span>
                          )}
                        </div>
                        
                        {conversation.lastMessage && (
                          <p className="text-sm text-slate-400 truncate mt-1">
                            {getSenderUsername(conversation.lastMessage.sender ?? undefined)
                              ? getSenderUsername(conversation.lastMessage.sender ?? undefined) + ': '
                              : ''}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                        
                        <p className="text-xs text-slate-500 mt-1">
                          {conversation.participants?.length || 0} members
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    className="ml-2 p-1 rounded hover:bg-red-600/20 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete conversation"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this conversation and all its messages?')) {
                        await deleteConversation(conversation._id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {adaptedConversation ? (
          <EnhancedChatWindow
            conversation={adaptedConversation}
            messages={conversationMessages as Message[]}
            currentUser={currentUser}
            typingIndicators={typingIndicators}
            onlineUsers={onlineUsers}
            onSendMessage={(content, type) => sendMessage(selectedConversationId!, content)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
              <p className="text-slate-400 mb-4">Choose from your existing conversations or start a new one</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Conversation Dialog */}
      <CreateConversationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onConversationCreated={async (conversationId) => {
          await handleCreateConversation([], undefined, undefined, conversationId);
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
};
