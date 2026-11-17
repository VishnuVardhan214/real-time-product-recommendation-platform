import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';

const catalog = [
  ['Noise-cancelling Headphones', 'Electronics', 6999, ['audio','wireless','music']],
  ['Mechanical Keyboard', 'Electronics', 4499, ['desk','gaming','computer']],
  ['Smart Watch', 'Electronics', 5999, ['fitness','wearable','health']],
  ['Portable Bluetooth Speaker', 'Electronics', 2499, ['audio','wireless','music']],
  ['Running Shoes', 'Fashion', 3299, ['fitness','running','sports']],
  ['Everyday Backpack', 'Fashion', 1899, ['travel','bag','daily']],
  ['Classic Hoodie', 'Fashion', 1499, ['casual','cotton','winter']],
  ['UV Protection Sunglasses', 'Fashion', 999, ['accessories','summer','travel']],
  ['Clean Code', 'Books', 599, ['programming','software','learning']],
  ['Deep Learning with Python', 'Books', 899, ['programming','ai','learning']],
  ['Atomic Habits', 'Books', 399, ['productivity','habits','learning']],
  ['The Pragmatic Programmer', 'Books', 749, ['programming','software','career']],
  ['Yoga Mat', 'Fitness', 1199, ['fitness','yoga','wellness']],
  ['Adjustable Dumbbells', 'Fitness', 4999, ['fitness','strength','home']],
  ['Insulated Water Bottle', 'Fitness', 699, ['fitness','daily','wellness']],
  ['Resistance Bands', 'Fitness', 499, ['fitness','strength','home']]
];

await connectDB();
await Product.deleteMany({});
await User.deleteMany({});
const products = await Product.insertMany(catalog.map(([name, category, price, tags], i) => ({
  name, category, price, tags, inventory: 20 + (i % 15),
  description: `${name} — a curated ${category.toLowerCase()} pick for everyday use.`,
  image: `https://placehold.co/600x400/eef2ff/3730a3?text=${encodeURIComponent(name.replaceAll(' ', '+'))}`
})));
const users = await User.insertMany(Array.from({ length: 200 }, (_, i) => ({
  displayName: `Demo Shopper ${String(i + 1).padStart(3, '0')}`,
  email: `shopper${i + 1}@demo.local`,
  segment: ['electronics', 'fashion', 'books', 'fitness', 'general'][i % 5]
})));
console.log(`Seeded ${products.length} products and ${users.length} simulated users.`);
await mongoose.disconnect();
