"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const db = await (0, database_1.getDatabase)();
        const meetings = await db.collection('meetings').find().toArray();
        res.json(meetings);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const db = await (0, database_1.getDatabase)();
        const meeting = await db.collection('meetings').findOne({ _id: req.params.id });
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        res.json(meeting);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
});
router.post('/', async (req, res) => {
    try {
        const db = await (0, database_1.getDatabase)();
        const result = await db.collection('meetings').insertOne(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create meeting' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const db = await (0, database_1.getDatabase)();
        const result = await db.collection('meetings').updateOne({ _id: req.params.id }, { $set: req.body });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update meeting' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const db = await (0, database_1.getDatabase)();
        const result = await db.collection('meetings').deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        res.json({ message: 'Meeting deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete meeting' });
    }
});
exports.default = router;
//# sourceMappingURL=meeting.js.map