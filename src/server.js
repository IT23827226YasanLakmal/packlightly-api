const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server ${PORT}`));
  } catch (err) {
    console.error('Startup error', err);
    process.exit(1);
  }
})();
