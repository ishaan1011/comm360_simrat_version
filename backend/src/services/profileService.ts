import { User, IUser } from '../models/user';
import mongoose from 'mongoose';

interface ProfileData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  settings?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  };
  notification_preferences?: {
    email?: boolean;
    push?: boolean;
    in_app?: boolean;
  };
}

export class ProfileService {
  async updateProfile(userId: string, data: ProfileData): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          ...data,
          updatedAt: new Date(),
        },
        { new: true }
      );
      return user;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  async getProfile(userId: string): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      const user = await User.findById(userId);
      return user;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  async updateSettings(userId: string, settings: ProfileData['settings']): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          settings,
          updatedAt: new Date(),
        },
        { new: true }
      );
      return user;
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  }

  async updateNotificationPreferences(userId: string, preferences: ProfileData['notification_preferences']): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          notificationPreferences: preferences,
          updatedAt: new Date(),
        },
        { new: true }
      );
      return user;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return null;
    }
  }
}

// Standalone functions for backward compatibility
export const updateProfile = async (userId: string, data: ProfileData) => {
  const profileService = new ProfileService();
  return await profileService.updateProfile(userId, data);
};

export const getProfile = async (userId: string) => {
  const profileService = new ProfileService();
  return await profileService.getProfile(userId);
};

export const updateSettings = async (userId: string, settings: ProfileData['settings']) => {
  const profileService = new ProfileService();
  return await profileService.updateSettings(userId, settings);
};

export const updateNotificationPreferences = async (userId: string, preferences: ProfileData['notification_preferences']) => {
  const profileService = new ProfileService();
  return await profileService.updateNotificationPreferences(userId, preferences);
}; 