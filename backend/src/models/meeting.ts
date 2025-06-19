import mongoose, { Schema, Document } from 'mongoose';

interface IParticipant {
  user: mongoose.Types.ObjectId;
  status: 'active' | 'muted' | 'left';
  joinedAt: Date;
}

export interface IMeeting extends Document {
  title: string;
  description?: string;
  host: mongoose.Types.ObjectId;
  participants: IParticipant[];
  startTime?: Date;
  endTime?: Date;
  status: 'scheduled' | 'active' | 'ended';
}

const participantSchema = new Schema<IParticipant>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'muted', 'left'],
    default: 'active',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const meetingSchema = new Schema<IMeeting>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [participantSchema],
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'ended'],
      default: 'scheduled',
    },
  },
  {
    timestamps: true,
  }
);

export const Meeting = mongoose.model<IMeeting>('Meeting', meetingSchema); 