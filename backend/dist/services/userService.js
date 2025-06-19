"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const firestore_1 = require("@google-cloud/firestore");
class UserService {
    constructor() {
        this.collection = 'users';
        this.db = new firestore_1.Firestore({
            projectId: process.env.GOOGLE_CLOUD_PROJECT,
        });
    }
    async createUser(userData) {
        const userRef = this.db.collection(this.collection).doc();
        const now = new Date();
        const user = {
            id: userRef.id,
            ...userData,
            createdAt: now,
            updatedAt: now,
        };
        await userRef.set(user);
        return user;
    }
    async getUserByEmail(email) {
        const snapshot = await this.db
            .collection(this.collection)
            .where('email', '==', email)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return null;
        }
        return snapshot.docs[0].data();
    }
    async updateUser(id, data) {
        const userRef = this.db.collection(this.collection).doc(id);
        const updateData = {
            ...data,
            updatedAt: new Date(),
        };
        await userRef.update(updateData);
        const doc = await userRef.get();
        return doc.exists ? doc.data() : null;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map