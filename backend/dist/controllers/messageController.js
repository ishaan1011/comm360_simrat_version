"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.markMessageAsRead = exports.getMessages = exports.sendMessage = exports.getConversation = exports.getConversations = exports.createConversation = void 0;
const messageService_1 = require("../services/messageService");
const messageService = new messageService_1.MessageService();
const createConversation = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { participants, type, name, avatar } = req.body;
        if (!participants.includes(req.user.email)) {
            participants.push(req.user.email);
        }
        const conversation = await messageService.createConversation({
            participants,
            type,
            name,
            avatar,
        });
        res.status(201).json(conversation);
    }
    catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ error: 'Failed to create conversation' });
    }
};
exports.createConversation = createConversation;
const getConversations = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const conversations = await messageService.getUserConversations(req.user.email);
        res.json(conversations);
    }
    catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Failed to get conversations' });
    }
};
exports.getConversations = getConversations;
const getConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await messageService.getConversation(id);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        res.json(conversation);
    }
    catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ error: 'Failed to get conversation' });
    }
};
exports.getConversation = getConversation;
const sendMessage = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { conversationId } = req.params;
        const { content, type, metadata } = req.body;
        const message = await messageService.sendMessage(conversationId, {
            senderId: req.user.email,
            content,
            type,
            metadata,
            readBy: [req.user.email],
        });
        res.status(201).json(message);
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit } = req.query;
        const messages = await messageService.getConversationMessages(conversationId, limit ? parseInt(limit) : undefined);
        res.json(messages);
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
};
exports.getMessages = getMessages;
const markMessageAsRead = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { messageId } = req.params;
        await messageService.markMessageAsRead(messageId, req.user.email);
        res.json({ message: 'Message marked as read' });
    }
    catch (error) {
        console.error('Mark message as read error:', error);
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
};
exports.markMessageAsRead = markMessageAsRead;
const deleteMessage = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { messageId } = req.params;
        await messageService.deleteMessage(messageId);
        res.status(204).send();
    }
    catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};
exports.deleteMessage = deleteMessage;
//# sourceMappingURL=messageController.js.map