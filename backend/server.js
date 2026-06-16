const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const Url = require('./models/Url');

dotenv.config();

connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:4200',
  'https://smarturl-frontend.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'SmartURL API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

app.get('/:alias', async (req, res) => {
  try {
    const url = await Url.findOne({ alias: req.params.alias.toLowerCase() });

    if (!url) {
      return res.status(404).send('Short URL not found');
    }

    url.clicks += 1;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (error) {
    return res.status(500).send('Unable to redirect this URL');
  }
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SmartURL backend running on port ${PORT}`);
  });
}

module.exports = app;

