const { MongoClient } = require('mongodb');

const DB_NAME = 'shop';
const COLLECTION_NAME = 'products';

let cached = global._mongoCached;
if (!cached) {
  cached = global._mongoCached = { client: null, promise: null };
}

async function getProductsCollection() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');

  if (cached.client) {
    return cached.client.db(DB_NAME).collection(COLLECTION_NAME);
  }

  if (!cached.promise) {
    const client = new MongoClient(uri);
    cached.promise = client.connect().then(() => client);
  }

  cached.client = await cached.promise;
  return cached.client.db(DB_NAME).collection(COLLECTION_NAME);
}

module.exports = { getProductsCollection };
