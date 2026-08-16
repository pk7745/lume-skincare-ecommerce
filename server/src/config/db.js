import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { env } from './env.js';

let memServer = null;

function sanitizeMongoUri(uri) {
  if (!uri) return '';
  return uri.replace(/\/\/(.*?)@/, '//***:***@');
}

export async function connectDB(uri = process.env.MONGODB_URI || env.MONGODB_URI) {
  const targetUri = uri || 'mongodb://127.0.0.1:27017/lume';
  const isAtlas = targetUri.startsWith('mongodb+srv://');
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Primary MONGODB_URI (Production MongoDB Atlas or Configured URI)
  try {
    const opts = isAtlas
      ? { serverSelectionTimeoutMS: 5000 }
      : { serverSelectionTimeoutMS: 2000 };

    const conn = await mongoose.connect(targetUri, opts);
    const dbName = conn.connection.name || 'lume';
    const host = conn.connection.host || 'MongoDB Cluster';
    console.log(`[MongoDB Connected (Primary)]: ${host}/${dbName} (${sanitizeMongoUri(targetUri)})`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Primary Error]: Connection failed to ${sanitizeMongoUri(targetUri)}: ${error.message}`);
    
    // In production, NEVER fall back to local memory database
    if (isProduction) {
      throw new Error(`[MongoDB Production Failure]: Failed to connect to primary database MONGODB_URI in production mode. System will not fall back to local or in-memory database.`);
    }

    console.log('[MongoDB Development Fallback]: Checking local disk-persistent engine on port 27018...');
  }

  // 2. Development Fallback to Local Disk-Persistent Database Engine (.data/mongodb on port 27018)
  const fallbackUri = 'mongodb://127.0.0.1:27018/lume';
  try {
    const conn = await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 1500 });
    console.log(`[MongoDB Connected (Disk-Persistent 27018)]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err2) {
    console.log('[MongoDB Development]: Launching disk-persisted database engine on port 27018 (.data/mongodb)...');

    const dbPath = path.resolve(process.cwd(), '.data/mongodb');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memServer = await MongoMemoryServer.create({
        instance: {
          port: 27018,
          dbPath,
          storageEngine: 'wiredTiger',
        },
      });

      const conn = await mongoose.connect(memServer.getUri('lume'));
      console.log(`[MongoDB Connected (Disk-Persistent Engine)]: ${conn.connection.host}/${conn.connection.name}`);

      try {
        const { Product } = await import('../models/Product.js');
        const productCount = await Product.countDocuments({});
        if (productCount === 0) {
          const { seedDatabase } = await import('../scripts/seedRunner.js');
          await seedDatabase();
        } else {
          console.log(`[MongoDB]: Disk database contains ${productCount} products. Preserving persistent state.`);
        }
      } catch (seedErr) {
        console.error('[MongoDB Init Warning]:', seedErr.message);
      }

      return conn;
    } catch (launchErr) {
      console.error('[MongoDB Engine Launch Error]:', launchErr.message);
      throw launchErr;
    }
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memServer) {
    await memServer.stop();
  }
}
