import express from 'express';
import { Meeting } from '../models/meeting';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all meetings
router.get('/', async (_req, res) => {
  try {
    const meetings = await Meeting.find();
    return res.json(meetings);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Get a single meeting
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid meeting ID' });
    }
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    return res.json(meeting);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch meeting' });
  }
});

// Create a meeting
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const { title, description, startTime, endTime } = req.body;
    const meeting = new Meeting({
      title,
      description,
      host: userId,
      participants: [{ user: userId, status: 'active', joinedAt: new Date() }],
      startTime,
      endTime,
    });
    await meeting.save();
    return res.status(201).json(meeting);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Update a meeting
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid meeting ID' });
    }
    const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    return res.json(meeting);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// Delete a meeting
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid meeting ID' });
    }
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    return res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

export default router; 