const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByUsername } = require('../utils/db');
const { createAvatar } = require('../utils/users'); // Reuse avatar logic? Or just use Gravatar/Robohash directly.
// Actually, let's just generate a robohash if none provided.

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

// REGISTER
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }

  // Check if user exists
  findUserByUsername(username, async (err, user) => {
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Avatar
    const avatar = `https://robohash.org/${username}.png`;

    // Save User
    createUser(username, hashedPassword, avatar, (err, id) => {
      if (err) return res.status(500).json({ msg: 'Server error registering user' });

      // Create Token
      const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        token,
        user: { id, username, avatar }
      });
    });
  });
});

// LOGIN
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  findUserByUsername(username, async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create Token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      }
    });
  });
});

// VERIFY TOKEN (Get Current User)
router.get('/me', (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) return res.json(null); // No token, no user

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Return user info (could query DB to be sure, but token is enough for now)
    findUserByUsername(decoded.username, (err, user) => {
       if(!user) return res.json(null);
       res.json({
         id: user.id,
         username: user.username,
         avatar: user.avatar
       });
    });
  } catch (e) {
    res.json(null);
  }
});

module.exports = router;
