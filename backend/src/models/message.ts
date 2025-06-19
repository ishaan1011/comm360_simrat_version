import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversation: string;
  sender: string;
  content: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  reactions: {
    emoji: string;
    users: string[];
  }[];
}

const messageSchema = new Schema({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  reactions: [
    {
      emoji: { type: String, required: true },
      users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }
  ]
}, {
  timestamps: true
});

export const Message = mongoose.model<IMessage>('Message', messageSchema); 