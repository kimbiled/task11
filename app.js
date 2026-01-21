require('dotenv').config();
const app = require('./api/index');

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Local Express running on http://localhost:${PORT}`);
});
