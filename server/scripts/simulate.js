import 'dotenv/config';
import mongoose from 'mongoose';
import mqtt from 'mqtt';
import { connectDB } from '../src/config/db.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';

await connectDB();
const [users, products] = await Promise.all([User.find().lean(), Product.find().lean()]);
if (!users.length || !products.length) throw new Error('Run npm run seed --prefix server before simulation');
const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883');
await new Promise((resolve, reject) => { client.once('connect', resolve); client.once('error', reject); });
const topic = process.env.MQTT_TOPIC || 'interactions/events';
const count = Number(process.argv[2] || 1000);
const types = ['view', 'view', 'click', 'cart', 'wishlist', 'purchase'];
for (let i = 0; i < count; i++) {
  const user = users[Math.floor(Math.random() * users.length)];
  const product = products[Math.floor(Math.random() * products.length)];
  const event = { eventId: `sim-${Date.now()}-${i}`, userId: String(user._id), productId: String(product._id), eventType: types[Math.floor(Math.random() * types.length)], source: 'simulator', occurredAt: new Date().toISOString() };
  client.publish(topic, JSON.stringify(event), { qos: 1 });
  if ((i + 1) % 100 === 0) console.log(`Published ${i + 1}/${count} events`);
  await new Promise(resolve => setTimeout(resolve, 10));
}
client.end();
await mongoose.disconnect();
console.log(`Published ${count} simulated interaction events.`);
