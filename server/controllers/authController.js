const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const { signToken } = require('../utils/token');
const env = require('../config/env');

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  res.cookie('token', token, cookieOptions);
  sendSuccess(res, 201, { user: user.toSafeObject(), token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions);
  sendSuccess(res, 200, { user: user.toSafeObject(), token });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  sendSuccess(res, 200, { message: 'Logged out successfully' });
});

const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user.toSafeObject() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, profile } = req.body;
  if (name) req.user.name = name;
  if (profile) req.user.profile = { ...req.user.profile.toObject(), ...profile };
  await req.user.save();
  sendSuccess(res, 200, { user: req.user.toSafeObject() });
});

module.exports = { register, login, logout, getMe, updateProfile };
