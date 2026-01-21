require('dotenv').config();

const express = require('express');
const path = require('path');

const apiApp = require('./api/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(apiApp);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Local server running at http://localhost:${PORT}`);
});
