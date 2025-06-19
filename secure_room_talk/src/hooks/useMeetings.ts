import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Meeting } from '@/types/meeting';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await api.meetings.getAll();
      setMeetings(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch meetings');
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const createMeeting = async (meetingData: Partial<Meeting>) => {
    try {
      const newMeeting = await api.meetings.create(meetingData);
      setMeetings((prev) => [...prev, newMeeting]);
      toast({
        title: "Meeting Created",
        description: `Room code: ${newMeeting.room_code} (${newMeeting.is_private ? 'Private' : 'Public'})`,
      });
      return newMeeting;
    } catch (err) {
      setError('Failed to create meeting');
      console.error('Error creating meeting:', err);
      toast({
        title: "Error creating meeting",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateMeeting = async (id: string, meetingData: Partial<Meeting>) => {
    try {
      const updatedMeeting = await api.meetings.update(id, meetingData);
      setMeetings((prev) =>
        prev.map((meeting) =>
          meeting.id === id ? updatedMeeting : meeting
        )
      );
      return updatedMeeting;
    } catch (err) {
      setError('Failed to update meeting');
      console.error('Error updating meeting:', err);
      toast({
        title: "Error updating meeting",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      await api.meetings.delete(id);
      setMeetings((prev) => prev.filter((meeting) => meeting.id !== id));
    } catch (err) {
      setError('Failed to delete meeting');
      console.error('Error deleting meeting:', err);
      toast({
        title: "Error deleting meeting",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    }
  };

  const joinMeeting = async (id: string) => {
    try {
      const updatedMeeting = await api.meetings.join(id);
      setMeetings((prev) =>
        prev.map((meeting) =>
          meeting.id === id ? updatedMeeting : meeting
        )
      );
      return updatedMeeting;
    } catch (err) {
      setError('Failed to join meeting');
      console.error('Error joining meeting:', err);
      toast({
        title: "Error joining meeting",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    }
  };

  const leaveMeeting = async (id: string) => {
    try {
      const updatedMeeting = await api.meetings.leave(id);
      setMeetings((prev) =>
        prev.map((meeting) =>
          meeting.id === id ? updatedMeeting : meeting
        )
      );
      return updatedMeeting;
    } catch (err) {
      setError('Failed to leave meeting');
      console.error('Error leaving meeting:', err);
      toast({
        title: "Error leaving meeting",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchMeetings();
    }
  }, [user]);

  return {
    meetings,
    loading,
    error,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    joinMeeting,
    leaveMeeting,
    refreshMeetings: fetchMeetings,
  };
}; 