import { Meeting } from '../models/meeting';
import mongoose from 'mongoose';

export class MeetingService {
  async createMeeting(data: {
    title: string;
    description?: string;
    host: mongoose.Types.ObjectId;
    participants?: mongoose.Types.ObjectId[];
    startTime?: Date;
    endTime?: Date;
    status?: 'scheduled' | 'active' | 'ended';
  }): Promise<Meeting> {
    const meeting = new Meeting(data);
    await meeting.save();
    return meeting;
  }

  async getMeeting(id: string): Promise<Meeting | null> {
    return Meeting.findById(id);
  }

  async updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting | null> {
    return Meeting.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteMeeting(id: string): Promise<Meeting | null> {
    return Meeting.findByIdAndDelete(id);
  }

  async getUserMeetings(userId: string): Promise<Meeting[]> {
    return Meeting.find({
      $or: [
        { host: new mongoose.Types.ObjectId(userId) },
        { participants: new mongoose.Types.ObjectId(userId) },
      ],
    });
  }

  async addParticipant(meetingId: string, userId: string): Promise<void> {
    const meetingRef = this.db.collection(this.collection).doc(meetingId);
    await meetingRef.update({
      participants: Firestore.FieldValue.arrayUnion(userId),
      updatedAt: new Date(),
    });
  }

  async removeParticipant(meetingId: string, userId: string): Promise<void> {
    const meetingRef = this.db.collection(this.collection).doc(meetingId);
    await meetingRef.update({
      participants: Firestore.FieldValue.arrayRemove(userId),
      updatedAt: new Date(),
    });
  }
} 