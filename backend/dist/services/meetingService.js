"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingService = void 0;
const firestore_1 = require("@google-cloud/firestore");
class MeetingService {
    constructor() {
        this.collection = 'meetings';
        this.db = new firestore_1.Firestore({
            projectId: process.env.GOOGLE_CLOUD_PROJECT,
        });
    }
    async createMeeting(meetingData) {
        const meetingRef = this.db.collection(this.collection).doc();
        const now = new Date();
        const meeting = {
            id: meetingRef.id,
            ...meetingData,
            createdAt: now,
            updatedAt: now,
        };
        await meetingRef.set(meeting);
        return meeting;
    }
    async getMeeting(id) {
        const doc = await this.db.collection(this.collection).doc(id).get();
        return doc.exists ? doc.data() : null;
    }
    async updateMeeting(id, data) {
        const meetingRef = this.db.collection(this.collection).doc(id);
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };
        await meetingRef.update(updateData);
        const doc = await meetingRef.get();
        return doc.exists ? doc.data() : null;
    }
    async deleteMeeting(id) {
        await this.db.collection(this.collection).doc(id).delete();
    }
    async getUserMeetings(userId) {
        const snapshot = await this.db
            .collection(this.collection)
            .where('participants', 'array-contains', userId)
            .orderBy('startTime', 'desc')
            .get();
        return snapshot.docs.map(doc => doc.data());
    }
    async addParticipant(meetingId, userId) {
        const meetingRef = this.db.collection(this.collection).doc(meetingId);
        await meetingRef.update({
            participants: firestore_1.Firestore.FieldValue.arrayUnion(userId),
            updatedAt: new Date(),
        });
    }
    async removeParticipant(meetingId, userId) {
        const meetingRef = this.db.collection(this.collection).doc(meetingId);
        await meetingRef.update({
            participants: firestore_1.Firestore.FieldValue.arrayRemove(userId),
            updatedAt: new Date(),
        });
    }
}
exports.MeetingService = MeetingService;
//# sourceMappingURL=meetingService.js.map