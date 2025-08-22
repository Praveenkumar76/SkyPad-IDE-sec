const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || '';

async function connectToDatabase() {
  if (!MONGODB_URI) {
    // eslint-disable-next-line no-console
    console.warn('[MongoDB] MONGODB_URI not set. Skipping DB connection.');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    // eslint-disable-next-line no-console
    console.log('[MongoDB] Connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[MongoDB] Connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { connectToDatabase };


