import React, { useState } from 'react';
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
  Pin
} from 'lucide-react';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { EnhancedChatWindow } from './EnhancedChatWindow';
import { CreateConversationDialog } from './CreateConversationDialog';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
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
    typingIndicators,
    onlineUsers,
    loading,
    sendMessage,
    fetchMessages,
    createConversation
  } = useRealTimeMessages();

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const conversationMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some(p => 
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
    setSelectedConversationId(conversationId);
    fetchMessages(conversationId);
  };

  const handleCreateConversation = async (participantIds: string[], name?: string, type?: string) => {
    const conversationId = await createConversation(participantIds, name, type);
    if (conversationId) {
      setSelectedConversationId(conversationId);
      setShowCreateDialog(false);
    }
  };

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
            <h2 className="text-xl font-semibold text-white">Messages</h2>
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
              <Button
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="mt-2"
                variant="outline"
              >
                Start a conversation
              </Button>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const otherParticipant = conversation.type === 'direct' 
                ? conversation.participants.find(p => p.id !== currentUser.id)
                : null;

              const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant.id) : false;

              return (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation.id)}
                  className={`p-4 border-b border-slate-700 cursor-pointer transition-colors hover:bg-slate-750 ${
                    selectedConversationId === conversation.id ? 'bg-slate-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {conversation.type === 'direct' && otherParticipant ? (
                        <>
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherParticipant.avatar_url} />
                            <AvatarFallback>
                              {otherParticipant.full_name?.charAt(0) || otherParticipant.username?.charAt(0)}
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
                      
                      {conversation.unread_count > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white truncate">
                          {conversation.name}
                        </h3>
                        {conversation.last_message && (
                          <span className="text-xs text-slate-400">
                            {formatTime(conversation.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      
                      {conversation.last_message && (
                        <p className="text-sm text-slate-400 truncate mt-1">
                          {conversation.last_message.sender?.username}: {conversation.last_message.content}
                        </p>
                      )}
                      
                      {conversation.type === 'group' && (
                        <p className="text-xs text-slate-500 mt-1">
                          {conversation.participants.length} members
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <EnhancedChatWindow
            conversation={selectedConversation}
            messages={conversationMessages}
            currentUser={currentUser}
            typingIndicators={[]}
            onlineUsers={[]}
            onSendMessage={(content, type) => sendMessage(selectedConversationId!, content, type)}
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
        onClose={() => setShowCreateDialog(false)}
        onCreateConversation={handleCreateConversation}
        currentUser={currentUser}
      />
    </div>
  );
};
