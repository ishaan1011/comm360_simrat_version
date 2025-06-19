"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.handleGoogleAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const userService_1 = require("../services/userService");
const userService = new userService_1.UserService();
const handleGoogleAuth = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const { email, name, picture } = req.user;
        let user = await userService.getUserByEmail(email);
        if (!user) {
            user = await userService.createUser({
                email,
                name,
                picture,
            });
        }
        res.json({
            user,
            message: 'Authentication successful',
        });
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.handleGoogleAuth = handleGoogleAuth;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = await (0, database_1.getDatabase)();
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '24h' });
        res.json({ token, user });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to login' });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to logout' });
    }
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map