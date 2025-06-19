import { User, IUser } from '../models/user';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export class UserService {
  async authenticateUser(email: string, password: string): Promise<IUser> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    return user;
  }

  async authenticateGoogleUser(idToken: string): Promise<IUser> {
    if (!idToken) {
      throw new Error('No Google ID token provided');
    }
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
    } catch (err) {
      throw new Error('Invalid Google ID token');
    }
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Google token did not return email');
    }
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        email: payload.email,
        username: payload.email.split('@')[0],
        full_name: payload.name,
        avatar_url: payload.picture,
      });
      await user.save();
    }
    return user;
  }

  async createUser(data: {
    email: string;
    password?: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  }): Promise<IUser> {
    const user = new User(data);
    await user.save();
    return user;
  }

  async getUserById(id: mongoose.Types.ObjectId): Promise<IUser | null> {
    return User.findById(id);
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async updateUser(id: mongoose.Types.ObjectId, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteUser(id: mongoose.Types.ObjectId): Promise<IUser | null> {
    return User.findByIdAndDelete(id);
  }
} 