import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Video, Plus, Users, Clock, Copy, Lock, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MeetingRoom } from './MeetingRoom';
import { useMeetings } from '@/hooks/useMeetings';
import { useAuth } from '@/components/auth/AuthProvider';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface MeetingViewProps {
  currentUser: User;
}

export const MeetingView = ({ currentUser }: MeetingViewProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { meetings, loading, createMeeting, joinMeeting } = useMeetings();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingPrivate, setNewMeetingPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  if (activeRoomId) {
    const activeMeeting = meetings.find((m) => m.id === activeRoomId);
    if (!activeMeeting) return null;
    return <MeetingRoom 
      meeting={activeMeeting} 
      currentUser={currentUser} 
      onLeave={() => setActiveRoomId(null)} 
    />;
  }

  const handleCreateMeeting = async () => {
    if (!newMeetingTitle.trim()) return;
    
    const meeting = await createMeeting({ title: newMeetingTitle, is_private: newMeetingPrivate });
    if (meeting) {
      setNewMeetingTitle('');
      setNewMeetingPrivate(false);
    }
  };

  const handleJoinMeeting = async () => {
    if (!joinCode.trim()) return;
    
    const meeting = await joinMeeting(joinCode);
    if (meeting) {
      setActiveRoomId(meeting.id);
      setJoinCode('');
    }
  };

  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Room Code Copied",
      description: "Share this code with participants",
    });
  };

  if (loading) {
    return (
      <div className="h-full bg-slate-900 p-6 flex items-center justify-center">
        <div className="text-white">Loading meetings...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Meetings</h1>
            <p className="text-slate-400 mt-1">Create or join video meetings</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Meeting */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Meeting
            </h2>
            <div className="space-y-4">
              <Input
                placeholder="Meeting title"
                value={newMeetingTitle}
                onChange={(e) => setNewMeetingTitle(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {newMeetingPrivate ? <Lock className="h-4 w-4 text-slate-400" /> : <Globe className="h-4 w-4 text-slate-400" />}
                  <span className="text-sm text-slate-400">
                    {newMeetingPrivate ? 'Private meeting' : 'Public meeting'}
                  </span>
                </div>
                <Switch
                  checked={newMeetingPrivate}
                  onCheckedChange={setNewMeetingPrivate}
                />
              </div>
              <Button 
                onClick={handleCreateMeeting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={!newMeetingTitle.trim()}
              >
                <Video className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </div>
          </Card>

          {/* Join Meeting */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Join Meeting
            </h2>
            <div className="space-y-4">
              <Input
                placeholder="Enter room code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Button 
                onClick={handleJoinMeeting}
                variant="outline"
                className="w-full border-slate-600 text-white hover:bg-slate-700"
                disabled={!joinCode.trim()}
              >
                Join Room
              </Button>
            </div>
          </Card>
        </div>

        {/* Meeting List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Your Meetings</h2>
          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <Card key={meeting.id} className="bg-slate-800 border-slate-700 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                      {meeting.is_active && (
                        <Badge className="bg-green-500 text-white">Live</Badge>
                      )}
                      {meeting.is_private ? (
                        <Badge variant="outline" className="border-orange-500 text-orange-400">
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500 text-green-400">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                      <span>Host: {meeting.host?.full_name || meeting.host?.username}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {meeting.participants?.length || 0} participants
                      </span>
                      {meeting.scheduled_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(meeting.scheduled_time).toLocaleTimeString()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Room Code:</span>
                        <code className="bg-slate-700 px-2 py-1 rounded text-white text-sm">
                          {meeting.room_code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyRoomCode(meeting.room_code)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setActiveRoomId(meeting.id)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
