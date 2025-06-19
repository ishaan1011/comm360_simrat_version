import express from 'express';
import { Message } from '../models/message';
import mongoose from 'mongoose';
import { Conversation } from '../models/conversation';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes in this router
router.use(authenticateToken);

// Get all conversations for the logged-in user
router.get('/conversations', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'id username full_name avatar_url email');
    return res.json(conversations);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get all messages for a conversation
router.get('/conversations/:conversationId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }
    const messages = await Message.find({ conversation: req.params.conversationId })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/conversations/:conversationId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }
    const message = new Message({
      ...req.body,
      conversation: req.params.conversationId,
    });
    await message.save();
    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.put('/:messageId/read', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { $set: { read: true } },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    return res.json(message);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Delete a message
router.delete('/:messageId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }
    const message = await Message.findByIdAndDelete(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    return res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Create a new conversation
router.post('/conversations', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const { participants, type, name, avatar } = req.body;
    // Ensure the current user is included in participants
    const allParticipants = Array.from(new Set([userId, ...(participants || [])]));

    // Prevent duplicate 2-person group conversations
    if ((type === 'group' || !type) && allParticipants.length === 2) {
      // Find any group conversation with exactly these two participants
      const existing = await Conversation.findOne({
        type: 'group',
        participants: { $all: allParticipants.map(id => new mongoose.Types.ObjectId(id)), $size: 2 }
      });
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    const conversation = new Conversation({
      participants: allParticipants.map(id => new mongoose.Types.ObjectId(id)),
      type: type || 'direct',
      name,
      avatar,
    });
    await conversation.save();
    return res.status(201).json(conversation);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Create a new message in a conversation
router.post('/conversations/:conversationId/messages', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }
    const { content, type } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    const message = new Message({
      conversation: req.params.conversationId,
      sender: userId,
      content,
      type: type || 'text',
    });
    await message.save();
    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// Add or remove a reaction to a message
router.patch('/:messageId/reactions', async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }
    const { emoji } = req.body;
    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    // Find the reaction object for this emoji
    const reaction = message.reactions.find((r: any) => r.emoji === emoji);
    if (reaction) {
      const userIndex = reaction.users.findIndex((u: any) => u === userId);
      if (userIndex > -1) {
        // User already reacted, remove their reaction
        reaction.users.splice(userIndex, 1);
        // If no users left for this emoji, remove the reaction object
        if (reaction.users.length === 0) {
          message.reactions = message.reactions.filter((r: any) => r.emoji !== emoji);
        }
      } else {
        // Add user to the reaction
        reaction.users.push(userId);
      }
    } else {
      // Add new reaction
      message.reactions.push({ emoji, users: [userId] });
    }
    await message.save();
    return res.json(message);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update reactions' });
  }
});

export default router; 