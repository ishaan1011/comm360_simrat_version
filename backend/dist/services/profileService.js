"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationPreferences = exports.updateSettings = exports.getProfile = exports.updateProfile = exports.ProfileService = void 0;
const firestore_1 = require("@google-cloud/firestore");
const database_1 = require("../config/database");
class ProfileService {
    constructor() {
        this.collection = 'users';
        this.db = new firestore_1.Firestore({
            projectId: process.env.GOOGLE_CLOUD_PROJECT,
        });
    }
    async updateProfile(userId, data) {
        const userRef = this.db.collection(this.collection).doc(userId);
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };
        await userRef.update(updateData);
        const doc = await userRef.get();
        return doc.exists ? doc.data() : null;
    }
    async getProfile(userId) {
        const doc = await this.db.collection(this.collection).doc(userId).get();
        return doc.exists ? doc.data() : null;
    }
    async updateSettings(userId, settings) {
        const userRef = this.db.collection(this.collection).doc(userId);
        await userRef.update({
            settings,
            updatedAt: new Date(),
        });
        const doc = await userRef.get();
        return doc.exists ? doc.data() : null;
    }
    async updateNotificationPreferences(userId, preferences) {
        const userRef = this.db.collection(this.collection).doc(userId);
        await userRef.update({
            notificationPreferences: preferences,
            updatedAt: new Date(),
        });
        const doc = await userRef.get();
        return doc.exists ? doc.data() : null;
    }
}
exports.ProfileService = ProfileService;
const updateProfile = async (userId, data) => {
    const db = await (0, database_1.getDatabase)();
    const result = await db.collection('profiles').updateOne({ userId }, { $set: data }, { upsert: true });
    return result;
};
exports.updateProfile = updateProfile;
const getProfile = async (userId) => {
    const db = await (0, database_1.getDatabase)();
    const profile = await db.collection('profiles').findOne({ userId });
    return profile;
};
exports.getProfile = getProfile;
const updateSettings = async (userId, settings) => {
    const db = await (0, database_1.getDatabase)();
    const result = await db.collection('profiles').updateOne({ userId }, { $set: { settings } }, { upsert: true });
    return result;
};
exports.updateSettings = updateSettings;
const updateNotificationPreferences = async (userId, preferences) => {
    const db = await (0, database_1.getDatabase)();
    const result = await db.collection('profiles').updateOne({ userId }, { $set: { notification_preferences: preferences } }, { upsert: true });
    return result;
};
exports.updateNotificationPreferences = updateNotificationPreferences;
//# sourceMappingURL=profileService.js.map