const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/settings
exports.get = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// PATCH /api/settings/profile  (name, phone, image, preferences)
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  ['name', 'phone', 'profileImage'].forEach((f) => {
    if (req.body[f] !== undefined) user[f] = req.body[f];
  });
  if (req.body.preferences) {
    const { emailNotifications, theme } = req.body.preferences;
    if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;
    if (theme !== undefined) user.preferences.theme = theme;
  }
  await user.save();
  res.json({ success: true, data: user });
});

// PATCH /api/settings/password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('currentPassword and newPassword are required');
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is wrong');
  }
  user.password = newPassword; // pre-save hook hash kar dega
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});