
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./models/User');

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({
      email: 'hr@empowerhr.com'
    }).select('+password');

    if (!user) {
      console.log('HR user not found');
      return;
    }

    user.password = 'HR@123456';
    await user.save();

    console.log('HR password reset successfully');
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword();
