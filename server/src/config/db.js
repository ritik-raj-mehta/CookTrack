import mongoose from 'mongoose';

const connectDB = async (mongoUri) => {
  const uri = mongoUri || process.env.MONGO_URI || 'mongodb://localhost:27017/CookTrack';
  if (!mongoUri && !process.env.MONGO_URI) {
    console.warn('⚠️ WARNING: MONGO_URI is not set in server/.env! Falling back to local MongoDB.');
  }
  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000
    });

    console.log(`✅ MongoDB Atlas connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    if (
      err.message.includes('buffering timed out') ||
      err.message.includes('ECONNREFUSED') ||
      err.message.includes('ETIMEDOUT') ||
      err.message.includes('ENOTFOUND')
    ) {
      console.error(
        '👉 TIP: Please ensure your IP address is whitelisted in MongoDB Atlas under Network Access (or set to 0.0.0.0/0).'
      );
    }
    process.exit(1);
  }
};

export default connectDB;
