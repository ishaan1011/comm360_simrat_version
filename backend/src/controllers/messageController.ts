import { Response } from 'express';
import { MessageService } from '../services/messageService';
import { AuthRequest } from '../middleware/auth';

const messageService = new MessageService();

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { participants, type, name, avatar } = req.body;
    
    // Ensure the current user is included in participants
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
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const conversations = await messageService.getUserConversations(req.user.email);
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const conversation = await messageService.getConversation(id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
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
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { limit } = req.query;

    const messages = await messageService.getConversationMessages(
      conversationId,
      limit ? parseInt(limit as string) : undefined
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

export const markMessageAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { messageId } = req.params;
    await messageService.markMessageAsRead(messageId, req.user.email);
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { messageId } = req.params;
    await messageService.deleteMessage(messageId);
    res.status(204).send();
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
}; 