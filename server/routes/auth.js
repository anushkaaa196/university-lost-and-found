const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Helper: generate JWT (now includes role)
function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Valid email is required')
      .custom((v) => {
        if (!/^[a-zA-Z0-9._%+-]+@niet\.co\.in$/.test(v)) throw new Error('Must be a valid @niet.co.in email');
        return true;
      }),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('studentId')
      .trim()
      .notEmpty()
      .withMessage('Student ID is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const { name, email, password, studentId } = req.body;

      // Check existing
      const existing = await User.findOne({ email });
      if (existing)
        return res.status(400).json({ message: 'Email already registered' });

      // Hardcoded super-admin: auto-assign admin role
      const SUPER_ADMIN_EMAIL = '0241csiot028@niet.co.in';
      const role = email.toLowerCase() === SUPER_ADMIN_EMAIL ? 'admin' : 'user';

      const user = await User.create({ name, email, password, studentId, role });
      const token = signToken(user);

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
        },
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('Valid email is required')
      .custom((v) => {
        if (!/^[a-zA-Z0-9._%+-]+@niet\.co\.in$/.test(v)) throw new Error('Only @niet.co.in emails can log in');
        return true;
      }),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user)
        return res.status(400).json({ message: 'Invalid credentials' });

      const isMatch = await user.comparePassword(password);
      if (!isMatch)
        return res.status(400).json({ message: 'Invalid credentials' });

      const token = signToken(user);
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/auth/me
const auth = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
