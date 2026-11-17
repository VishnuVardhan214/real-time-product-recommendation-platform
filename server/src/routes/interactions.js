import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import Interaction from '../models/Interaction.js';
import { publishInteraction } from '../services/mqtt.js';
const router = Router();
const allowed = new Set(['view', 'click', 'cart', 'purchase', 'wishlist']);
router.post('/', async (req, res, next) => {
  try {
    const { userId, productId, eventType, source = 'web' } = req.body;
    if (!userId || !productId || !allowed.has(eventType)) {
      return res.status(400).json({ message: 'userId, productId and a valid eventType are required' });
    }
    const event = { eventId: randomUUID(), userId, productId, eventType, source, occurredAt: new Date() };
    // Publish first: the MQTT consumer persists and recomputes recommendations asynchronously.
    publishInteraction(event);
    res.status(202).json({ accepted: true, eventId: event.eventId, message: 'Interaction queued' });
  } catch (err) { next(err); }
});
router.get('/:userId', async (req, res, next) => {
  try {
    const events = await Interaction.find({ userId: req.params.userId }).sort({ occurredAt: -1 }).limit(50).populate('productId', 'name category').lean();
    res.json(events);
  } catch (err) { next(err); }
});
export default router;
