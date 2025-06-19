"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.getDatabase = exports.connectToDatabase = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fb47bced-2c48-4442-8cef-16aa573ee377.nam5.firestore.goog';
let client;
const connectToDatabase = async () => {
    if (client) {
        return client;
    }
    try {
        client = new mongodb_1.MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to Firestore');
        return client;
    }
    catch (error) {
        console.error('Firestore connection error:', error);
        process.exit(1);
    }
};
exports.connectToDatabase = connectToDatabase;
const getDatabase = async () => {
    const client = await (0, exports.connectToDatabase)();
    return client.db();
};
exports.getDatabase = getDatabase;
const closeDatabase = async () => {
    if (client) {
        await client.close();
        console.log('Database connection closed');
    }
};
exports.closeDatabase = closeDatabase;
//# sourceMappingURL=database.js.map