"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationPreferences = exports.updateSettings = exports.getProfile = exports.updateProfile = void 0;
const profileService_1 = require("../services/profileService");
const profileService = new profileService_1.ProfileService();
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const updatedProfile = await profileService.updateProfile(req.user.email, req.body);
        if (!updatedProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(updatedProfile);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const profile = await profileService.getProfile(req.user.email);
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(profile);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
};
exports.getProfile = getProfile;
const updateSettings = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const updatedProfile = await profileService.updateSettings(req.user.email, req.body);
        if (!updatedProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(updatedProfile);
    }
    catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
exports.updateSettings = updateSettings;
const updateNotificationPreferences = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const updatedProfile = await profileService.updateNotificationPreferences(req.user.email, req.body);
        if (!updatedProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(updatedProfile);
    }
    catch (error) {
        console.error('Update notification preferences error:', error);
        res.status(500).json({ error: 'Failed to update notification preferences' });
    }
};
exports.updateNotificationPreferences = updateNotificationPreferences;
//# sourceMappingURL=profileController.js.map