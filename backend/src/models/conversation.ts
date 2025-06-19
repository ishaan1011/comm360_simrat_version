import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct',
  },
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
}, {
  timestamps: true,
});

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema); 