import mongoose from 'mongoose';
import { User } from '../src/models/user';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comm360';

async function deleteUser() {
  await mongoose.connect(MONGODB_URI);
  const email = 'simrat7303@gmail.com';
  const result = await User.deleteOne({ email });
  if (result.deletedCount) {
    console.log('User deleted:', email);
  } else {
    console.log('User not found:', email);
  }
  await mongoose.disconnect();
}

deleteUser().catch(err => {
  console.error(err);
  mongoose.disconnect();
}); 