const { MongoClient } = require('mongodb');

const DB_NAME = 'shop';

let cached = global._mongoCached;
if (!cached) {
  cached = global._mongoCached = { client: null, promise: null };
}

async function getClient() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');

  if (cached.client) return cached.client;

  if (!cached.promise) {
    const client = new MongoClient(uri);
    cached.promise = client.connect().then(() => client);
  }

  cached.client = await cached.promise;
  return cached.client;
}

async function getProductsCollection() {
  const client = await getClient();
  return client.db(DB_NAME).collection('products');
}

async function getItemsCollection() {
  const client = await getClient();
  return client.db(DB_NAME).collection('items');
}

module.exports = { getProductsCollection, getItemsCollection };
