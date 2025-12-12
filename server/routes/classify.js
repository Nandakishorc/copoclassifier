const express = require('express');
const router = express.Router();
const { classify } = require('../utils/classifier');
const History = require('../models/History');

router.post('/', async (req, res) => {
  try {
    const { question, rules, map, save } = req.body;
    if (!question) return res.status(400).json({ error: 'Question required' });
    const result = classify(question, rules, map);
    if (save && process.env.MONGO_URI) {
      try {
        const h = await History.create({
          question: result.question,
          bestCO: result.bestCO,
          pos: result.pos,
          score: result.bestScore,
          matchedKeywords: result.matchedKeywords
        });
        result.savedId = h._id;
      } catch (e) { /* ignore */ }
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
