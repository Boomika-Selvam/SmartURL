const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const sendAuthResponse = (res, user) => {
  const token = createToken(user._id);

  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || ''
    }
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({ name, email, password });
    return sendAuthResponse(res, user);
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return sendAuthResponse(res, user);
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: payload.name || email.split('@')[0],
        email,
        googleId: payload.sub,
        avatar: payload.picture || ''
      });
    } else {
      user.googleId = user.googleId || payload.sub;
      user.avatar = user.avatar || payload.picture || '';
      await user.save();
    }

    return sendAuthResponse(res, user);
  } catch (error) {
    return res.status(401).json({ message: 'Google login failed' });
  }
};

const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe
};

