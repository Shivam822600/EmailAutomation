const mongoose = require('mongoose');
const { env } = require('./env');

const getMongoConnectionHint = (error) => {
  if (error.message.includes('querySrv')) {
    return [
      'MongoDB Atlas SRV DNS lookup failed.',
      'Try switching DNS to 8.8.8.8 or 1.1.1.1, check your internet/VPN/firewall, or use the non-SRV Atlas connection string.',
    ].join(' ');
  }

  if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
    return 'MongoDB authentication failed. Check your database username and password in MONGODB_URI.';
  }

  if (error.message.includes('IP') || error.message.includes('whitelist')) {
    return 'MongoDB Atlas network access blocked. Add your current IP address in Atlas Network Access.';
  }

  return 'MongoDB connection failed. Check MONGODB_URI, Atlas cluster status, and network access.';
};

const connectDB = async () => {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected');
  } catch (error) {
    error.message = `${error.message}\nHint: ${getMongoConnectionHint(error)}`;
    throw error;
  }
};

module.exports = connectDB;
