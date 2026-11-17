import mqtt from 'mqtt';
import Interaction from '../models/Interaction.js';
import { getRecommendations } from './recommender.js';

let client;
export function startMqttConsumer(io) {
  const url = process.env.MQTT_URL || 'mqtt://localhost:1883';
  const topic = process.env.MQTT_TOPIC || 'interactions/events';
  client = mqtt.connect(url, { reconnectPeriod: 2000, connectTimeout: 5000 });
  client.on('connect', () => {
    console.log(`MQTT connected: ${url}`);
    client.subscribe(topic, { qos: 1 }, err => err && console.error('MQTT subscribe failed:', err.message));
  });
  client.on('error', err => console.error('MQTT error:', err.message));
  client.on('message', async (_topic, payload) => {
    try {
      const event = JSON.parse(payload.toString());
      const saved = await Interaction.findOneAndUpdate(
        { eventId: event.eventId },
        { $setOnInsert: event },
        { upsert: true, new: true }
      );
      const recommendations = await getRecommendations(saved.userId, 8);
      io.emit('recommendations:updated', {
        userId: String(saved.userId),
        recommendations,
        processedAt: new Date().toISOString()
      });
      io.emit('interaction:processed', { userId: String(saved.userId), eventType: saved.eventType });
    } catch (err) {
      console.error('Unable to process MQTT event:', err.message);
    }
  });
  return client;
}

export function publishInteraction(event) {
  if (!client?.connected) throw new Error('MQTT broker is not connected');
  const topic = process.env.MQTT_TOPIC || 'interactions/events';
  client.publish(topic, JSON.stringify(event), { qos: 1 });
}
