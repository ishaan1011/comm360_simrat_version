import { handleGoogleAuth, login, logout } from '../controllers/authController';
import express from 'express';

const router = express.Router();

// Google OAuth authentication route
router.post('/google', handleGoogleAuth);
router.post('/login', login);
router.post('/logout', logout);

export default router; 