import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Settings,
  Users,
  MessageSquare,
  Share
} from 'lucide-react';
import { useMeetings } from '@/hooks/useMeetings';
import { HostControls } from './HostControls';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Participant {
  id: string;
  user_id: string;
  role: string;
  user?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Meeting {
  id: string;
  title: string;
  host_id: string;
  is_active: boolean;
}

interface MeetingRoomProps {
  meeting: Meeting;
  currentUser: User;
  onLeave: () => void;
}

export const MeetingRoom = ({ meeting, currentUser, onLeave }: MeetingRoomProps) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const { 
    meetings, 
    participants, 
    joinMeeting, 
    leaveMeeting, 
    loading: meetingsLoading 
  } = useMeetings();
  const { toast } = useToast();

  const currentMeeting = meeting;
  const meetingParticipants = participants.filter(p => p.meeting_id === meeting.id);

  useEffect(() => {
    if (meeting.id && currentUser.id) {
      joinMeeting(meeting.id, currentUser.id);
    }
  }, [meeting.id, currentUser.id, joinMeeting]);

  const handleLeaveMeeting = async () => {
    try {
      await leaveMeeting(meeting.id, currentUser.id);
      onLeave();
    } catch (error) {
      console.error('Error leaving meeting:', error);
      toast({
        title: "Error leaving meeting",
        description: "There was an error leaving the meeting",
        variant: "destructive"
      });
    }
  };

  const handleMeetingEnd = () => {
    onLeave();
  };

  const handleParticipantUpdate = () => {
    // Refresh participants data
    console.log('Participant updated, refreshing data...');
  };

  if (meetingsLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading meeting...</div>
      </div>
    );
  }

  if (!currentMeeting) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Meeting not found</h2>
          <Button onClick={onLeave}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">{currentMeeting.title}</h1>
            <Badge className="bg-green-500 text-white">
              {currentMeeting.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-slate-300 hover:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              {meetingParticipants.length}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="text-slate-300 hover:text-white"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {/* Current User Video */}
              <Card className="bg-slate-800 border-slate-700 relative overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="text-xl">
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute bottom-2 left-2 flex gap-1">
                  <Badge className={isVideoOn ? "bg-green-500" : "bg-red-500"}>
                    {isVideoOn ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
                  </Badge>
                  <Badge className={isAudioOn ? "bg-green-500" : "bg-red-500"}>
                    {isAudioOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge className="bg-blue-500 text-white text-xs">You</Badge>
                </div>
              </Card>

              {/* Other Participants */}
              {meetingParticipants
                .filter(p => p.user_id !== currentUser.id)
                .map((participant) => (
                <Card key={participant.id} className="bg-slate-800 border-slate-700 relative overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={participant.user?.avatar_url} />
                      <AvatarFallback className="text-xl">
                        {participant.user?.full_name?.charAt(0) || participant.user?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    <Badge className="bg-green-500">
                      <Video className="h-3 w-3" />
                    </Badge>
                    <Badge className="bg-green-500">
                      <Mic className="h-3 w-3" />
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Badge className="bg-slate-600 text-white text-xs">
                      {participant.user?.full_name || participant.user?.username}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-800 border-t border-slate-700 p-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isAudioOn ? "default" : "destructive"}
                size="lg"
                onClick={() => setIsAudioOn(!isAudioOn)}
                className="rounded-full w-12 h-12 p-0"
              >
                {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>

              <Button
                variant={isVideoOn ? "default" : "destructive"}
                size="lg"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className="rounded-full w-12 h-12 p-0"
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-12 h-12 p-0"
              >
                <Share className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-12 h-12 p-0"
              >
                <Settings className="h-5 w-5" />
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={handleLeaveMeeting}
                className="rounded-full w-12 h-12 p-0"
              >
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
            {showParticipants && (
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold text-white mb-4">
                  Participants ({meetingParticipants.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {meetingParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3 p-2 rounded bg-slate-700">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.user?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {participant.user?.full_name?.charAt(0) || participant.user?.username?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {participant.user?.full_name || participant.user?.username}
                          {participant.user_id === currentUser.id && (
                            <span className="text-slate-400 ml-1">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">
                          {participant.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Host Controls */}
            <div className="p-4">
              <HostControls
                meetingId={meeting.id}
                hostId={currentMeeting.host_id}
                participants={meetingParticipants}
                onMeetingEnd={handleMeetingEnd}
                onParticipantUpdate={handleParticipantUpdate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
