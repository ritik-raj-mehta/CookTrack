import mongoose from 'mongoose';

const connectDB = async (mongoUri) => {
  try {
    await mongoose.connect(mongoUri || 'mongodb://localhost:27017/CookTrack');

    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;
