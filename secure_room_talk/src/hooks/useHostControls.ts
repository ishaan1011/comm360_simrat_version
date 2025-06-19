import { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export const useHostControls = (meetingId: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const startMeeting = async () => {
    try {
      setLoading(true);
      const updatedMeeting = await api.meetings.update(meetingId, { is_active: true });
      toast({
        title: "Meeting Started",
        description: "The meeting has been started successfully",
      });
      return updatedMeeting;
    } catch (err) {
      setError('Failed to start meeting');
      console.error('Error starting meeting:', err);
      toast({
        title: "Error starting meeting",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const endMeeting = async () => {
    try {
      setLoading(true);
      const updatedMeeting = await api.meetings.update(meetingId, { is_active: false });
      toast({
        title: "Meeting Ended",
        description: "The meeting has been ended successfully",
      });
      return updatedMeeting;
    } catch (err) {
      setError('Failed to end meeting');
      console.error('Error ending meeting:', err);
      toast({
        title: "Error ending meeting",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeParticipant = async (participantId: string) => {
    try {
      setLoading(true);
      const updatedMeeting = await api.meetings.update(meetingId, {
        remove_participant: participantId,
      });
      toast({
        title: "Participant Removed",
        description: "The participant has been removed from the meeting",
      });
      return updatedMeeting;
    } catch (err) {
      setError('Failed to remove participant');
      console.error('Error removing participant:', err);
      toast({
        title: "Error removing participant",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const muteParticipant = async (participantId: string) => {
    try {
      setLoading(true);
      const updatedMeeting = await api.meetings.update(meetingId, {
        mute_participant: participantId,
      });
      toast({
        title: "Participant Muted",
        description: "The participant has been muted",
      });
      return updatedMeeting;
    } catch (err) {
      setError('Failed to mute participant');
      console.error('Error muting participant:', err);
      toast({
        title: "Error muting participant",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unmuteParticipant = async (participantId: string) => {
    try {
      setLoading(true);
      const updatedMeeting = await api.meetings.update(meetingId, {
        unmute_participant: participantId,
      });
      toast({
        title: "Participant Unmuted",
        description: "The participant has been unmuted",
      });
      return updatedMeeting;
    } catch (err) {
      setError('Failed to unmute participant');
      console.error('Error unmuting participant:', err);
      toast({
        title: "Error unmuting participant",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    startMeeting,
    endMeeting,
    removeParticipant,
    muteParticipant,
    unmuteParticipant,
  };
};
