const express = require('express');
const multer = require('multer');
const router = express.Router();
const Discussion = require('../models/Discussion');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Create a new discussion
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { text, hashtags } = req.body;
  const image = req.file ? req.file.path : null;

  try {
    const discussion = new Discussion({
      text,
      image,
      hashtags: hashtags ? hashtags.split(',') : [],
      user: req.user._id
    });
    await discussion.save();
    res.status(201).send(discussion);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update a discussion
router.patch('/:id', auth, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (req.file) updates.image = req.file.path;

  try {
    const discussion = await Discussion.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updates,
      { new: true }
    );
    if (!discussion) return res.status(404).send({ message: 'Discussion not found' });
    res.send(discussion);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a discussion
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const discussion = await Discussion.findOneAndDelete({ _id: id, user: req.user._id });
    if (!discussion) return res.status(404).send({ message: 'Discussion not found' });
    res.send({ message: 'Discussion deleted successfully' });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get list of discussions based on tags
router.get('/by-tags', auth, async (req, res) => {
  const { tags } = req.query;
  const tagsArray = tags ? tags.split(',') : [];

  try {
    const discussions = await Discussion.find({ hashtags: { $in: tagsArray } });
    res.send(discussions);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get list of discussions based on text
router.get('/by-text', auth, async (req, res) => {
  const { text } = req.query;

  try {
    const discussions = await Discussion.find({ text: new RegExp(text, 'i') });
    res.send(discussions);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Like a discussion
router.post('/:id/like', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).send({ error: 'Discussion not found' });
    }
    if (!discussion.likes.includes(req.user._id)) {
      discussion.likes.push(req.user._id);
      await discussion.save();
    }
    res.send(discussion);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Unlike a discussion
router.post('/:id/unlike', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).send({ error: 'Discussion not found' });
    }
    discussion.likes = discussion.likes.filter(
      (like) => like.toString() !== req.user._id.toString()
    );
    await discussion.save();
    res.send(discussion);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Comment on a discussion
router.post('/:id/comment', auth, async (req, res) => {
  const { text } = req.body;
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).send({ error: 'Discussion not found' });
    }
    discussion.comments.push({ text, user: req.user._id });
    await discussion.save();
    res.send(discussion);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Like a comment
router.post('/:discussionId/comment/:commentId/like', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).send({ error: 'Discussion not found' });
    }
    const comment = discussion.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).send({ error: 'Comment not found' });
    }
    if (!comment.likes.includes(req.user._id)) {
      comment.likes.push(req.user._id);
      await discussion.save();
    }
    res.send(comment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Unlike a comment
router.post('/:discussionId/comment/:commentId/unlike', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).send({ error: 'Discussion not found' });
    }
    const comment = discussion.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).send({ error: 'Comment not found' });
    }
    comment.likes = comment.likes.filter(
      (like) => like.toString() !== req.user._id.toString()
    );
    await discussion.save();
    res.send(comment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a comment
router.delete('/:discussionId/comment/:commentId', auth, async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).send({ error: 'Discussion not found' });
    }
    const comment = discussion.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).send({ error: 'Comment not found' });
    }
    comment.remove();
    await discussion.save();
    res.send({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update a comment
router.patch('/:discussionId/comment/:commentId', auth, async (req, res) => {
  const { text } = req.body;
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) {
      return res.status(404).send({ error: 'Discussion not found' });
    }
    const comment = discussion.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).send({ error: 'Comment not found' });
    }
    comment.text = text;
    await discussion.save();
    res.send(comment);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Increment view count for a discussion
router.post('/:id/view', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).send({ error: 'Discussion not found' });
    }
    discussion.views += 1;
    await discussion.save();
    res.send(discussion);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;

