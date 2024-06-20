const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  text: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  replies: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdOn: { type: Date, default: Date.now }
});

const discussionSchema = new Schema({
  text: { type: String, required: true },
  image: { type: String },
  hashtags: { type: [String] },
  createdOn: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  comments: [commentSchema],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 }
});

module.exports = mongoose.model('Discussion', discussionSchema);
