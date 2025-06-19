import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService';
import { AppError } from '../utils/errorHandler';

const userService = new UserService();

export const handleGoogleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'No Google ID token provided' });
    }
    const user = await userService.authenticateGoogleUser(idToken);
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '7d' }
    );
    return res.json({ user, token: jwtToken });
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userService.authenticateUser(email, password);
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '7d' }
    );
    return res.json({ user, token: jwtToken });
  } catch (error) {
    throw new AppError('Invalid credentials', 401);
  }
};

export const logout = async (_req: Request, res: Response) => {
  try {
    // In a real application, you might want to invalidate the token
    // or perform other cleanup tasks
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    throw new AppError('Logout failed', 500);
  }
}; 