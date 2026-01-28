require('dotenv').config();
const express = require('express');
const { ObjectId } = require('mongodb');
const { getProductsCollection } = require('../lib/mongo');

const app = express();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());

app.get('/api/products', async (req, res) => {
  try {
    const productsCollection = await getProductsCollection();
    const { category, minPrice, sort, fields } = req.query;

    const filter = {};

    if (typeof category === 'string' && category.trim() !== '') {
      filter.category = category.trim();
    }

    if (minPrice !== undefined) {
      const min = Number(minPrice);
      if (!Number.isFinite(min)) {
        return res.status(400).json({ error: 'Invalid minPrice' });
      }
      filter.price = { $gte: min };
    }

    let projection;
    if (typeof fields === 'string' && fields.trim() !== '') {
      const allowedFields = new Set(['name', 'price', 'category']);
      const selected = fields
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean);

      if (selected.length === 0) {
        return res.status(400).json({ error: 'Invalid fields parameter' });
      }

      projection = {};
      for (const f of selected) {
        if (!allowedFields.has(f)) {
          return res
            .status(400)
            .json({ error: `Invalid field in fields: ${f}` });
        }
        projection[f] = 1;
      }
    }

    let sortOption;
    if (sort !== undefined) {
      if (sort === 'price') sortOption = { price: 1 };
      else
        return res
          .status(400)
          .json({ error: 'Invalid sort value (use sort=price)' });
    }

    let cursor = productsCollection.find(filter);
    if (projection) cursor = cursor.project(projection);
    if (sortOption) cursor = cursor.sort(sortOption);

    const products = await cursor.toArray();
    res.json({ count: products.length, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  try {
    const productsCollection = await getProductsCollection();
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, price, category } = req.body ?? {};

  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid field: name' });
  }
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return res.status(400).json({ error: 'Missing or invalid field: price' });
  }
  if (typeof category !== 'string' || category.trim() === '') {
    return res
      .status(400)
      .json({ error: 'Missing or invalid field: category' });
  }

  try {
    const productsCollection = await getProductsCollection();
    const newProduct = { name: name.trim(), price, category: category.trim() };
    const result = await productsCollection.insertOne(newProduct);

    res.status(201).json({ _id: result.insertedId, ...newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  const { name, price, category } = req.body ?? {};
  if (typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Missing or invalid field: name' });
  }
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return res.status(400).json({ error: 'Missing or invalid field: price' });
  }
  if (typeof category !== 'string' || category.trim() === '') {
    return res
      .status(400)
      .json({ error: 'Missing or invalid field: category' });
  }

  try {
    const productsCollection = await getProductsCollection();
    const result = await productsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name: name.trim(), price, category: category.trim() } },
      { returnDocument: 'after' },
    );

    if (!result.value)
      return res.status(404).json({ error: 'Product not found' });
    res.json(result.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  try {
    const productsCollection = await getProductsCollection();
    const result = await productsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/version', (req, res) => {
  res.json({
    version: '1.1',
    updatedAt: '2026-01-24',
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

module.exports = app;
