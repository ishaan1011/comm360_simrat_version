import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Send, 
  Paperclip, 
  Image, 
  Users, 
  Phone, 
  Video,
  MoreVertical,
  Search,
  Pin,
  Smile,
  Mic,
  VolumeX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';

interface User {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
}

interface Reaction {
  emoji: string;
  users: string[];
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
  reactions?: Reaction[];
}

interface Conversation {
  id: string;
  name?: string;
  type: string;
  participants: User[];
}

interface TypingIndicator {
  user_id: string;
  conversation_id: string;
  timestamp: number;
}

interface EnhancedChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUser: User;
  typingIndicators: TypingIndicator[];
  onlineUsers: string[];
  onSendMessage: (content: string, type?: string) => void;
}

export const EnhancedChatWindow = ({
  conversation,
  messages,
  currentUser,
  typingIndicators,
  onlineUsers,
  onSendMessage
}: EnhancedChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [updatingReactions, setUpdatingReactions] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState(messages);
  const { markMessagesAsRead, getMessageStatus, sendTyping } = useRealTimeMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searchActive, setSearchActive] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    setLocalMessages(messages);
  }, [messages]);

  // Mark messages as read when chat is focused
  useEffect(() => {
    if (document.hasFocus() && messages.length > 0) {
      const unread = messages.filter(m => !(m.readBy || []).includes(currentUser.id)).map(m => m.id);
      if (unread.length > 0) {
        markMessagesAsRead(conversation.id, unread);
      }
    }
  }, [messages, conversation.id, currentUser.id, markMessagesAsRead]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = () => {
    toast({
      title: "File Upload",
      description: "File upload feature would be integrated here",
    });
  };

  const handleImageUpload = () => {
    toast({
      title: "Image Upload",
      description: "Image upload feature would be integrated here",
    });
  };

  const handleVoiceMessage = () => {
    toast({
      title: "Voice Message",
      description: "Voice message feature would be integrated here",
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`/api/messages/conversations/${conversation.id}/attachments`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        onSendMessage(data.url, 'file');
        toast({ title: 'File uploaded', description: file.name });
      }
    } catch (e) {
      toast({ title: 'Upload failed', description: 'Could not upload file', variant: 'destructive' });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return date.toLocaleDateString([], { weekday: 'long' });
    return date.toLocaleDateString();
  };

  const EMOJI_OPTIONS = ['👍', '❤️', '😂', '🎉', '😮'];

  const handleReact = async (messageId: string, emoji: string) => {
    setUpdatingReactions(messageId + emoji);
    try {
      const updated = await api.messages.reactToMessage(messageId, emoji);
      setLocalMessages((prev) => prev.map((msg) => msg.id === updated._id ? { ...msg, reactions: updated.reactions } : msg));
    } catch (e) {
      toast({ title: 'Failed to react', description: 'Could not update reaction', variant: 'destructive' });
    } finally {
      setUpdatingReactions(null);
    }
  };

  const handleRetry = (msg: Message) => {
    try {
      onSendMessage(msg.content);
      toast({ title: 'Retrying...', description: 'Message is being resent.' });
    } catch (e) {
      toast({ title: 'Retry failed', description: 'Could not resend message.', variant: 'destructive' });
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const res = await fetch(`/api/messages/conversations/${conversation.id}/messages/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setSearchResults(data.map((msg: Message) => msg.id));
      setSearchActive(true);
      if (data.length > 0) {
        const el = document.getElementById(`msg-${data[0].id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {
      toast({ title: 'Search failed', description: 'Could not search messages', variant: 'destructive' });
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchActive(false);
  };

  const renderMessage = (msg: Message, index: number) => {
    const isOwnMessage = msg.sender_id === currentUser.id;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showDate = !prevMessage || 
      new Date(msg.created_at).toDateString() !== new Date(prevMessage.created_at).toDateString();
    const showAvatar = !prevMessage || 
      prevMessage.sender_id !== msg.sender_id ||
      (new Date(msg.created_at).getTime() - new Date(prevMessage.created_at).getTime()) > 300000; // 5 minutes
    const isSearchResult = searchResults.includes(msg.id);

    // Check for mentions in the message
    const renderContentWithMentions = (content: string) => {
      const mentionRegex = /@(\w+)/g;
      const parts = content.split(mentionRegex);
      
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          // This is a mention
          const mentionedUser = conversation.participants.find(p => 
            p.username?.toLowerCase().includes(part.toLowerCase()) ||
            p.full_name?.toLowerCase().includes(part.toLowerCase())
          );
          if (mentionedUser) {
            return (
              <span key={index} className="bg-blue-500 text-white px-1 rounded text-sm">
                @{part}
              </span>
            );
          }
        }
        return part;
      });
    };

    return (
      <div key={msg.id || msg.tempId} id={`msg-${msg.id}`}
        className={`flex gap-3 mb-2 ${isOwnMessage ? 'flex-row-reverse' : ''} ${showAvatar ? 'mt-4' : 'mt-1'} ${isSearchResult ? 'bg-yellow-100 dark:bg-yellow-900' : ''}`}>
        {showAvatar && !isOwnMessage && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={msg.senderObj?.avatar_url} />
            <AvatarFallback className="text-xs">
              {msg.senderObj?.full_name?.charAt(0) || msg.senderObj?.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}
        
        {!showAvatar && !isOwnMessage && (
          <div className="w-8 flex-shrink-0" />
        )}
        
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
          {showAvatar && !isOwnMessage && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-slate-300">
                {msg.senderObj?.full_name || msg.senderObj?.username}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                <span className="text-xs text-gray-400 ml-2">{getMessageStatus(msg, currentUser.id, conversation.participants)}</span>
                {msg.status === 'failed' && (
                  <button
                    className="ml-2 text-xs text-red-500 underline cursor-pointer"
                    onClick={() => handleRetry(msg)}
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          )}
          
          <div className={`rounded-lg px-3 py-2 ${
            isOwnMessage 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
              : 'bg-slate-700 text-white'
          }`}>
            <p className="text-sm break-words whitespace-pre-wrap">
              {renderContentWithMentions(msg.content)}
            </p>
          </div>
          
          {isOwnMessage && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
              <span className="text-xs text-gray-400 ml-2">{getMessageStatus(msg, currentUser.id, conversation.participants)}</span>
            </div>
          )}

          {Array.isArray(msg.reactions) && (
            <div className="flex gap-1 mt-1">
              {EMOJI_OPTIONS.map((emoji) => {
                const reaction = msg.reactions.find((r: Reaction) => r.emoji === emoji);
                const count = reaction ? reaction.users.length : 0;
                const reacted = reaction && reaction.users.includes(currentUser.id);
                return (
                  <button
                    key={emoji}
                    className={`px-2 py-1 rounded-full text-lg border ${reacted ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-200'} ${updatingReactions === msg.id + emoji ? 'opacity-50' : ''}`}
                    disabled={!!updatingReactions}
                    onClick={() => handleReact(msg.id, emoji)}
                  >
                    {emoji} {count > 0 && <span className="ml-1 text-xs">{count}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {msg.type === 'file' && msg.content && (
            <div className="mt-2">
              {msg.content.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={msg.content} alt="attachment" className="max-w-xs max-h-40 rounded" />
              ) : (
                <a href={msg.content} download className="text-blue-500 underline">Download file</a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const otherParticipant = conversation.type === 'direct' 
    ? conversation.participants.find(p => p.id !== currentUser.id)
    : null;

  // Helper to get the display name for the chat header
  const getChatHeaderName = () => {
    if (conversation.type === 'group') {
      return conversation.name;
    }
    if (otherParticipant) {
      return otherParticipant.full_name || otherParticipant.username || otherParticipant.email;
    }
    return '';
  };

  // Show typing indicator for other participants
  const isSomeoneTyping = typingIndicators.some(t => t.conversation_id === conversation.id && t.user_id !== currentUser.id);

  return (
    <>
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {conversation.type === 'direct' && otherParticipant ? (
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParticipant.avatar_url} />
                  <AvatarFallback>
                    {otherParticipant.full_name?.charAt(0) || otherParticipant.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {onlineUsers.includes(otherParticipant.id) && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                )}
              </div>
            ) : (
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
            )}
            
            <div>
              <h3 className="font-semibold text-white">{getChatHeaderName()}</h3>
              <p className="text-sm text-slate-400">
                {conversation.type === 'group' 
                  ? `${conversation.participants.length} members`
                  : onlineUsers.includes(otherParticipant?.id || '') 
                    ? 'Online' 
                    : 'Last seen recently'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="text-slate-400 hover:text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceMessage}
              className="text-slate-400 hover:text-white"
            >
              <Phone className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <Video className="h-4 w-4" />
            </Button>
            
            {conversation.type === 'group' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowParticipants(!showParticipants)}
                className="text-slate-400 hover:text-white"
              >
                <Users className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3">
            <div className="flex items-center gap-2 p-2 border-b border-slate-700">
              <Input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Search in conversation..."
                className="flex-1"
              />
              <Button onClick={handleSearch} size="sm">Search</Button>
              {searchActive && <Button onClick={clearSearch} size="sm" variant="outline">Clear</Button>}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarImage src={otherParticipant?.avatar_url} />
                    <AvatarFallback className="text-xl">
                      {otherParticipant?.full_name?.charAt(0) || otherParticipant?.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {conversation.name}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Send a message to start the conversation
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages
                  .filter(msg => 
                    !searchQuery || 
                    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((msg, index) => (
                    <div key={msg.id || `msg-${index}`}>
                      {renderMessage(msg, index)}
                    </div>
                  ))
                }
                
                {/* Typing Indicators */}
                {isSomeoneTyping && (
                  <div className="text-xs text-blue-400 py-2">Someone is typing...</div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-700 bg-slate-800">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <Paperclip className="w-5 h-5 text-gray-400" />
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageUpload}
                className="text-slate-400 hover:text-white"
              >
                <Image className="h-4 w-4" />
              </Button>
              
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  sendTyping(conversation.id);
                }}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${conversation.name}...`}
                className="flex-1 bg-slate-700 border-slate-600 text-white"
              />
              
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <Smile className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceMessage}
                className="text-slate-400 hover:text-white"
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Participants Panel */}
        {showParticipants && conversation.type === 'group' && (
          <div className="w-64 bg-slate-800 border-l border-slate-700 p-4">
            <h4 className="font-semibold text-white mb-4">
              Participants ({conversation.participants.length})
            </h4>
            <div className="space-y-3">
              {conversation.participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {participant.full_name?.charAt(0) || participant.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {onlineUsers.includes(participant.id) && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {participant.full_name || participant.username}
                      {participant.id === currentUser.id && (
                        <span className="text-slate-400 ml-1">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {onlineUsers.includes(participant.id) ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
