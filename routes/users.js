const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// User signup
router.post('/signup', async (req, res) => {
  const { name, mobileNo, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ name, mobileNo, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ _id: user._id }, 'your_jwt_secret');
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }
    const token = jwt.sign({ _id: user._id }, 'your_jwt_secret');
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Follow a user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).send({ error: 'User not found' });
    }
    if (!userToFollow.followers.includes(req.user._id)) {
      userToFollow.followers.push(req.user._id);
      req.user.following.push(userToFollow._id);
      await userToFollow.save();
      await req.user.save();
    }
    res.send({ userToFollow, user: req.user });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Unfollow a user
router.post('/:id/unfollow', auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).send({ error: 'User not found' });
    }
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (follower) => follower.toString() !== req.user._id.toString()
    );
    req.user.following = req.user.following.filter(
      (following) => following.toString() !== userToUnfollow._id.toString()
    );
    await userToUnfollow.save();
    await req.user.save();
    res.send({ userToUnfollow, user: req.user });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Search user based on name
router.get('/search', auth, async (req, res) => {
  const { name } = req.query;
  try {
    const users = await User.find({ name: new RegExp(name, 'i') });
    res.send(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get list of users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get user profile
router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});

// Update user profile
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'mobileNo', 'email', 'password'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    if (req.body.password) {
      req.user.password = await bcrypt.hash(req.body.password, 8);
    }
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete user profile
router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send({ message: 'User deleted' });
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
