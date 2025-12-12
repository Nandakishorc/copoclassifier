const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const HistorySchema = new Schema({
  question: { type: String, required: true },
  bestCO: String,
  pos: [String],
  score: Number,
  matchedKeywords: Object
}, { timestamps: true });
module.exports = mongoose.model('History', HistorySchema);
