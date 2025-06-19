
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, Users, Send, Paperclip, Image } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

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

interface MessagingViewProps {
  currentUser: User;
}

export const MessagingView = ({ currentUser }: MessagingViewProps) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      type: 'direct',
      participants: [
        currentUser,
        { id: '2', name: 'Alice Johnson', email: 'alice@example.com', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b29c?w=100&h=100&fit=crop&crop=face' }
      ],
      messages: [
        {
          id: '1',
          senderId: '2',
          content: 'Hey! How are you doing?',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          type: 'text'
        },
        {
          id: '2',
          senderId: currentUser.id,
          content: 'I\'m doing great! Thanks for asking. How about you?',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          type: 'text'
        }
      ],
      unreadCount: 1
    },
    {
      id: '2',
      name: 'Project Team',
      type: 'group',
      participants: [
        currentUser,
        { id: '2', name: 'Alice Johnson', email: 'alice@example.com', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b29c?w=100&h=100&fit=crop&crop=face' },
        { id: '3', name: 'Bob Smith', email: 'bob@example.com', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face' },
        { id: '4', name: 'Carol Davis', email: 'carol@example.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' }
      ],
      messages: [
        {
          id: '3',
          senderId: '3',
          content: 'Great work on the presentation everyone! 🎉',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          type: 'text'
        },
        {
          id: '4',
          senderId: '4',
          content: 'Thanks @Bob! Looking forward to our next milestone.',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          type: 'text'
        }
      ],
      unreadCount: 2
    }
  ]);

  const [newGroupName, setNewGroupName] = useState('');
  const [showNewGroup, setShowNewGroup] = useState(false);

  const selectedChatData = chats.find(chat => chat.id === selectedChat);

  const createGroupChat = () => {
    if (!newGroupName.trim()) return;
    
    const newChat: Chat = {
      id: Math.random().toString(36).substr(2, 9),
      name: newGroupName,
      type: 'group',
      participants: [currentUser],
      messages: [],
      unreadCount: 0
    };
    
    setChats([newChat, ...chats]);
    setNewGroupName('');
    setShowNewGroup(false);
    setSelectedChat(newChat.id);
  };

  const sendMessage = (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!selectedChat || !content.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      content,
      timestamp: new Date(),
      type
    };

    setChats(chats.map(chat => {
      if (chat.id === selectedChat) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage
        };
      }
      return chat;
    }));
  };

  return (
    <div className="h-full bg-slate-900 flex">
      {/* Chat List */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Messages</h2>
            <Button
              size="sm"
              onClick={() => setShowNewGroup(!showNewGroup)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {showNewGroup && (
            <div className="space-y-2">
              <Input
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={createGroupChat} disabled={!newGroupName.trim()}>
                  Create
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowNewGroup(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-slate-700 cursor-pointer transition-colors ${
                selectedChat === chat.id ? 'bg-slate-700' : 'hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {chat.type === 'direct' ? (
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.participants.find(p => p.id !== currentUser.id)?.avatar} />
                      <AvatarFallback>
                        {chat.participants.find(p => p.id !== currentUser.id)?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  )}
                  {chat.unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{chat.name}</h3>
                  {chat.lastMessage && (
                    <p className="text-sm text-slate-400 truncate">
                      {chat.lastMessage.content}
                    </p>
                  )}
                  {chat.type === 'group' && (
                    <p className="text-xs text-slate-500">
                      {chat.participants.length} members
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedChatData ? (
          <ChatWindow
            chat={selectedChatData}
            currentUser={currentUser}
            onSendMessage={sendMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
              <p className="text-slate-400">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
