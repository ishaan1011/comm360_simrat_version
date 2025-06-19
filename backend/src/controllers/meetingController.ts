import { Response } from 'express';
import { MeetingService } from '../services/meetingService';
import { AppError } from '../utils/errorHandler';
import { AuthRequest } from '../middleware/auth';

const meetingService = new MeetingService();

export const createMeeting = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const meeting = await meetingService.createMeeting({
      ...req.body,
      host: req.user.id,
    });

    return res.status(201).json(meeting);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to create meeting', 500);
  }
};

export const getMeeting = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const meeting = await meetingService.getMeeting(req.params.id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    return res.json(meeting);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get meeting', 500);
  }
};

export const updateMeeting = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const meeting = await meetingService.getMeeting(req.params.id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    if (meeting.host.toString() !== req.user.id) {
      throw new AppError('Not authorized to update this meeting', 403);
    }

    const updatedMeeting = await meetingService.updateMeeting(req.params.id, req.body);
    return res.json(updatedMeeting);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update meeting', 500);
  }
};

export const deleteMeeting = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const meeting = await meetingService.getMeeting(req.params.id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    if (meeting.host.toString() !== req.user.id) {
      throw new AppError('Not authorized to delete this meeting', 403);
    }

    await meetingService.deleteMeeting(req.params.id);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete meeting', 500);
  }
};

export const getUserMeetings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const meetings = await meetingService.getUserMeetings(req.user.id);
    return res.json(meetings);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get user meetings', 500);
  }
};

export const joinMeeting = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const meeting = await meetingService.getMeeting(req.params.id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    const updatedMeeting = await meetingService.updateMeeting(req.params.id, {
      participants: [...meeting.participants, req.user.id],
    });

    return res.json(updatedMeeting);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to join meeting', 500);
  }
};

export const leaveMeeting = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const meeting = await meetingService.getMeeting(req.params.id);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    const updatedMeeting = await meetingService.updateMeeting(req.params.id, {
      participants: meeting.participants.filter(
        (id) => id.toString() !== req.user!.id
      ),
    });

    return res.json(updatedMeeting);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to leave meeting', 500);
  }
}; 