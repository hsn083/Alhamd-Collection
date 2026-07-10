import dns from "node:dns";

// Force Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Optional
dns.setDefaultResultOrder("ipv4first");

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      
      // Register event listeners only once after successful connection
      if (!mongoose.connection.listenerCount('error')) {
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
        });
      }
      
      if (!mongoose.connection.listenerCount('disconnected')) {
        mongoose.connection.on('disconnected', () => {
          console.log('MongoDB disconnected');
        });
      }
      
      if (!mongoose.connection.listenerCount('reconnected')) {
        mongoose.connection.on('reconnected', () => {
          console.log('MongoDB reconnected');
        });
      }
      
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
