require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const classifyRouter = require('./routes/classify');
const historyRouter = require('./routes/history');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO = process.env.MONGO_URI || '';
if (MONGO) {
  mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=> console.log('Connected to MongoDB'))
    .catch(err=> console.warn('MongoDB connection failed:', err.message));
} else {
  console.log('No MONGO_URI provided — running without DB (history ephemeral).');
}

app.use('/api/classify', classifyRouter);
app.use('/api/history', historyRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log('Server running on ' + PORT));
