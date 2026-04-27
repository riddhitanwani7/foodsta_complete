const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FoodPartner = require('../models/FoodPartner');
const Session = require('../models/Session');

// Helper: generate tokens
const generateAccessToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, { expiresIn: '30m' });
};

const generateRefreshToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Register a new User
 * POST /api/auth/register/user
 */
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, 'User');
    const refreshToken = generateRefreshToken(user._id, 'User');

    // Store refresh token in session
    await Session.create({
      userId: user._id,
      userType: 'User',
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.status(201).json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      userType: 'User',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register User Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Register a new Food Partner
 * POST /api/auth/register/food-partner
 */
const registerFoodPartner = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const existingPartner = await FoodPartner.findOne({ email: email.toLowerCase() });
    if (existingPartner) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create food partner
    const partner = await FoodPartner.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
    });

    // Generate tokens
    const accessToken = generateAccessToken(partner._id, 'FoodPartner');
    const refreshToken = generateRefreshToken(partner._id, 'FoodPartner');

    // Store refresh token in session
    await Session.create({
      userId: partner._id,
      userType: 'FoodPartner',
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      user: {
        _id: partner._id,
        name: partner.name,
        email: partner.email,
      },
      userType: 'FoodPartner',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register Food Partner Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Login (supports both User and FoodPartner)
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'Email, password, and userType are required' });
    }

    let account = null;
    if (userType === 'User') {
      account = await User.findOne({ email: email.toLowerCase() });
    } else if (userType === 'FoodPartner') {
      account = await FoodPartner.findOne({ email: email.toLowerCase() });
    } else {
      return res.status(400).json({ message: 'Invalid userType' });
    }

    if (!account) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(account._id, userType);
    const refreshToken = generateRefreshToken(account._id, userType);

    // Store refresh token in session
    await Session.create({
      userId: account._id,
      userType,
      refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const userData = userType === 'User'
      ? { _id: account._id, fullName: account.fullName, email: account.email }
      : { _id: account._id, name: account.name, email: account.email };

    res.json({
      user: userData,
      userType,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Refresh Access Token
 * POST /api/auth/refresh
 */
const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Check if session exists in DB
    const session = await Session.findOne({ refreshToken, userId: decoded.id });
    if (!session) {
      return res.status(401).json({ message: 'Session not found' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.id, decoded.userType);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh Token Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Logout — delete session
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await Session.deleteOne({ refreshToken });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    let account;
    if (req.userType === 'User') {
      account = await User.findById(req.user).select('-password');
    } else {
      account = await FoodPartner.findById(req.user).select('-password');
    }

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({ user: account, userType: req.userType });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  registerFoodPartner,
  login,
  refreshToken: refreshTokenHandler,
  logout,
  getMe,
};
