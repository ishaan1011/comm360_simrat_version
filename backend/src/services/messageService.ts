import { Message } from '../models/message';
import mongoose from 'mongoose';

export class MessageService {
  async createMessage(data: {
    sender: mongoose.Types.ObjectId;
    content: string;
    conversationId: mongoose.Types.ObjectId;
    attachments?: string[];
  }) {
    const message = new Message(data);
    await message.save();
    return message;
  }

  async getMessages(conversationId: mongoose.Types.ObjectId) {
    return Message.find({ conversationId })
      .populate('sender', 'username avatar_url')
      .sort({ createdAt: -1 });
  }

  async getMessageById(id: mongoose.Types.ObjectId) {
    return Message.findById(id).populate('sender', 'username avatar_url');
  }

  async updateMessage(id: mongoose.Types.ObjectId, data: {
    content?: string;
    attachments?: string[];
  }) {
    return Message.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).populate('sender', 'username avatar_url');
  }

  async deleteMessage(id: mongoose.Types.ObjectId) {
    return Message.findByIdAndDelete(id);
  }

  async markAsRead(messageId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
    return Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: userId } },
      { new: true }
    );
  }

  async getUnreadCount(conversationId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) {
    return Message.countDocuments({
      conversationId,
      readBy: { $ne: userId }
    });
  }
} 