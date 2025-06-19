
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Paperclip, Image, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
}

interface Chat {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatWindowProps {
  chat: Chat;
  currentUser: User;
  onSendMessage: (content: string, type?: 'text' | 'image' | 'file') => void;
}

export const ChatWindow = ({ chat, currentUser, onSendMessage }: ChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserById = (id: string) => {
    return chat.participants.find(p => p.id === id) || currentUser;
  };

  const renderMessage = (msg: Message) => {
    const sender = getUserById(msg.senderId);
    const isOwnMessage = msg.senderId === currentUser.id;

    // Check for mentions in the message
    const renderContentWithMentions = (content: string) => {
      const mentionRegex = /@(\w+)/g;
      const parts = content.split(mentionRegex);
      
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          // This is a mention
          const mentionedUser = chat.participants.find(p => 
            p.name.toLowerCase().includes(part.toLowerCase())
          );
          if (mentionedUser) {
            return (
              <span key={index} className="bg-blue-500 text-white px-1 rounded">
                @{part}
              </span>
            );
          }
        }
        return part;
      });
    };

    return (
      <div key={msg.id} className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''} mb-4`}>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={sender.avatar} />
          <AvatarFallback className="text-xs">
            {sender.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-xs`}>
          {!isOwnMessage && (
            <span className="text-xs text-slate-400 mb-1">{sender.name}</span>
          )}
          
          <div className={`rounded-lg px-3 py-2 ${
            isOwnMessage 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
              : 'bg-slate-700 text-white'
          }`}>
            <p className="text-sm break-words">
              {renderContentWithMentions(msg.content)}
            </p>
          </div>
          
          <span className="text-xs text-slate-500 mt-1">
            {formatTime(msg.timestamp)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {chat.type === 'direct' ? (
              <Avatar className="h-10 w-10">
                <AvatarImage src={chat.participants.find(p => p.id !== currentUser.id)?.avatar} />
                <AvatarFallback>
                  {chat.participants.find(p => p.id !== currentUser.id)?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-white">{chat.name}</h3>
              <p className="text-sm text-slate-400">
                {chat.type === 'group' ? `${chat.participants.length} members` : 'Direct message'}
              </p>
            </div>
          </div>
          
          {chat.type === 'group' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-slate-400 hover:text-white"
            >
              <Users className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {chat.messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-700 bg-slate-800">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFileUpload}
                className="text-slate-400 hover:text-white"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageUpload}
                className="text-slate-400 hover:text-white"
              >
                <Image className="h-4 w-4" />
              </Button>
              
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${chat.name}...`}
                className="flex-1 bg-slate-700 border-slate-600 text-white"
              />
              
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
        {showParticipants && chat.type === 'group' && (
          <div className="w-64 bg-slate-800 border-l border-slate-700 p-4">
            <h4 className="font-semibold text-white mb-4">Participants ({chat.participants.length})</h4>
            <div className="space-y-3">
              {chat.participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback className="text-xs">
                      {participant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {participant.name}
                      {participant.id === currentUser.id && (
                        <span className="text-slate-400 ml-1">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{participant.email}</p>
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
