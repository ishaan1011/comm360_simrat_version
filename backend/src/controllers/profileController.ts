import { Response } from 'express';
import { ProfileService } from '../services/profileService';
import { AppError } from '../utils/errorHandler';
import { AuthRequest } from '../middleware/auth';

const profileService = new ProfileService();

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const profile = await profileService.updateProfile(req.user.id, req.body);
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    return res.json(profile);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update profile', 500);
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const profile = await profileService.getProfile(req.user.id);
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    return res.json(profile);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to get profile', 500);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const profile = await profileService.updateSettings(req.user.id, req.body);
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    return res.json(profile);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update settings', 500);
  }
};

export const updateNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const profile = await profileService.updateNotificationPreferences(
      req.user.id,
      req.body
    );
    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    return res.json(profile);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to update notification preferences', 500);
  }
}; 