require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const careerRoutes = require('./routes/career');
const searchRoutes = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/career', careerRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    model: 'llama-3.1-8b-instant',
    keyLoaded: !!process.env.GROQ_API_KEY
  });
});

// Fallback → serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✦ Firdous running on http://0.0.0.0:${PORT}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠  GROQ_API_KEY not set in .env — AI features will fail.');
  }
});
