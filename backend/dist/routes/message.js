"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const mongodb_1 = require("mongodb");
const router = express_1.default.Router();
router.get('/conversations/:conversationId', async (req, res) => {
    try {
        const db = await (0, database_1.getDatabase)();
        const messages = await db.collection('messages')
            .find({ conversation: new mongodb_1.ObjectId(req.params.conversationId) })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
router.post('/conversations/:conversationId', async (req, res) => {
    try {
        const db = await (0, database_1.getDatabase)();
        const message = {
            ...req.body,
            conversation: new mongodb_1.ObjectId(req.params.conversationId),
            createdAt: new Date()
        };
        const result = await db.collection('messages').insertOne(message);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});
router.put('/:messageId/read', async (req, res) => {
    try {
        const db = await (0, database_1.getDatabase)();
        const result = await db.collection('messages').updateOne({ _id: new mongodb_1.ObjectId(req.params.messageId) }, { $set: { read: true } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
});
router.delete('/:messageId', async (req, res) => {
    try {
        const db = await (0, database_1.getDatabase)();
        const result = await db.collection('messages').deleteOne({ _id: new mongodb_1.ObjectId(req.params.messageId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
});
exports.default = router;
//# sourceMappingURL=message.js.map