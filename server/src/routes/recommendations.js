import { Router } from 'express';
import mongoose from 'mongoose';
import { getRecommendations } from '../services/recommender.js';
const router = Router();
router.get('/:userId', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) return res.status(400).json({ message: 'Invalid userId' });
    const limit = Number.parseInt(req.query.limit || '8', 10);
    res.json(await getRecommendations(req.params.userId, Number.isFinite(limit) ? limit : 8));
  } catch (err) { next(err); }
});
export default router;
