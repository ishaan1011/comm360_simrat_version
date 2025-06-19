import mongoose from 'mongoose';
import { User } from '../src/models/user';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comm360';

async function createDefaultUser() {
  await mongoose.connect(MONGODB_URI);

  // User 1
  const email1 = 'simrat7303@gmail.com';
  const password1 = 'Simrat0703*';
  const username1 = 'simrat7303';
  const full_name1 = 'Simrat';

  const existing1 = await User.findOne({ email: email1 });
  if (!existing1) {
    const user1 = new User({ email: email1, password: password1, username: username1, full_name: full_name1 });
    await user1.save();
    console.log('Default user created:', email1);
  } else {
    console.log('User already exists:', email1);
  }

  // User 2
  const email2 = 'alexdoe@example.com';
  const password2 = 'AlexPassword123!';
  const username2 = 'alexdoe';
  const full_name2 = 'Alex Doe';

  const existing2 = await User.findOne({ email: email2 });
  if (!existing2) {
    const user2 = new User({ email: email2, password: password2, username: username2, full_name: full_name2 });
    await user2.save();
    console.log('Default user created:', email2);
  } else {
    console.log('User already exists:', email2);
  }

  await mongoose.disconnect();
}

createDefaultUser().catch(err => {
  console.error(err);
  mongoose.disconnect();
}); 