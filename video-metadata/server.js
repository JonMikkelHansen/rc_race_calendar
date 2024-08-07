// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const API_KEY = process.env.REACT_APP_JWPLAYER_API_KEY;
const API_SECRET = process.env.REACT_APP_JWPLAYER_API_SECRET;

app.get('/generate-token', (req, res) => {
  const token = jwt.sign({}, API_SECRET, {
    algorithm: 'HS256',
    expiresIn: '1h',
    issuer: API_KEY,
  });
  res.json({ token });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});