"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const message_1 = require("../models/message");
class MessageService {
    async createMessage(data) {
        const message = new message_1.Message(data);
        await message.save();
        return message;
    }
    async getMessages(conversationId) {
        return message_1.Message.find({ conversationId })
            .populate('sender', 'username avatar_url')
            .sort({ createdAt: -1 });
    }
    async getMessageById(id) {
        return message_1.Message.findById(id).populate('sender', 'username avatar_url');
    }
    async updateMessage(id, data) {
        return message_1.Message.findByIdAndUpdate(id, { $set: data }, { new: true }).populate('sender', 'username avatar_url');
    }
    async deleteMessage(id) {
        return message_1.Message.findByIdAndDelete(id);
    }
    async markAsRead(messageId, userId) {
        return message_1.Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: userId } }, { new: true });
    }
    async getUnreadCount(conversationId, userId) {
        return message_1.Message.countDocuments({
            conversationId,
            readBy: { $ne: userId }
        });
    }
}
exports.MessageService = MessageService;
//# sourceMappingURL=messageService.js.map