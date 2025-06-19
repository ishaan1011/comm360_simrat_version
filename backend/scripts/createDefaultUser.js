const mongoose = require('mongoose');
// Try to import the compiled JS model if running from dist, otherwise fallback to ts-node usage
let User;
try {
  // Try compiled JS (if you have run tsc)
  User = require('../dist/models/user').User;
} catch (e) {
  // Fallback: require ts-node and import TS directly
  require('ts-node').register();
  User = require('../src/models/user').User;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comm360';

async function createDefaultUser() {
  await mongoose.connect(MONGODB_URI);
  const email = 'simrat7303@gmail.com';
  const password = 'Simrat0703*';
  const username = 'simrat7303';
  const full_name = 'Simrat';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('User already exists:', email);
    await mongoose.disconnect();
    return;
  }

  const user = new User({ email, password, username, full_name });
  await user.save();
  console.log('Default user created:', email);
  await mongoose.disconnect();
}

createDefaultUser().catch(err => {
  console.error(err);
  mongoose.disconnect();
}); 