
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  PhoneOff, 
  UserX, 
  MicOff, 
  Mic,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { useHostControls } from '@/hooks/useHostControls';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

interface HostControlsProps {
  meetingId: string;
  hostId: string;
  participants: Participant[];
  onMeetingEnd: () => void;
  onParticipantUpdate: () => void;
}

export const HostControls = ({ 
  meetingId, 
  hostId, 
  participants, 
  onMeetingEnd,
  onParticipantUpdate 
}: HostControlsProps) => {
  const { isHost, loading, endMeeting, removeParticipant, toggleParticipantMute } = useHostControls({
    meetingId,
    hostId
  });

  if (!isHost) {
    return null;
  }

  const handleEndMeeting = async () => {
    const success = await endMeeting();
    if (success) {
      onMeetingEnd();
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    const success = await removeParticipant(participantId);
    if (success) {
      onParticipantUpdate();
    }
  };

  const activeParticipants = participants.filter(p => p.user_id !== hostId);

  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-white">Host Controls</h3>
        <Badge className="bg-yellow-500 text-black">Host</Badge>
      </div>

      <div className="space-y-4">
        {/* End Meeting */}
        <div className="flex items-center justify-between">
          <span className="text-slate-300">End Meeting</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                disabled={loading}
                className="gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                End Meeting
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-800 border-slate-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  End Meeting
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-300">
                  Are you sure you want to end this meeting? All participants will be disconnected and the meeting will be closed permanently.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-slate-700 text-white border-slate-600">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleEndMeeting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  End Meeting
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Participants Management */}
        {activeParticipants.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-white mb-3">Manage Participants</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activeParticipants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {participant.user?.full_name?.charAt(0) || participant.user?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {participant.user?.full_name || participant.user?.username}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">
                        {participant.role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleParticipantMute(participant.user_id, false)}
                      className="h-8 w-8 p-0 border-slate-600"
                    >
                      <MicOff className="h-3 w-3" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          <UserX className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-800 border-slate-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Remove Participant</AlertDialogTitle>
                          <AlertDialogDescription className="text-slate-300">
                            Are you sure you want to remove {participant.user?.full_name || participant.user?.username} from the meeting?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-slate-700 text-white border-slate-600">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleRemoveParticipant(participant.user_id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
