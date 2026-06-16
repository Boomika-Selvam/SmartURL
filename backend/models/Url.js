const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  alias: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  shortUrl: {
    type: String,
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Url', urlSchema);

