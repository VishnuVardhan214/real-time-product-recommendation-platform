import { Router } from 'express';
import User from '../models/User.js';
const router = Router();
router.get('/', async (_req, res, next) => {
  try { res.json(await User.find().sort({ displayName: 1 }).lean()); }
  catch (err) { next(err); }
});
router.post('/', async (req, res, next) => {
  try {
    const { displayName, email, segment } = req.body;
    if (!displayName?.trim()) return res.status(400).json({ message: 'displayName is required' });
    const user = await User.create({ displayName: displayName.trim(), email, segment });
    res.status(201).json(user);
  } catch (err) { next(err); }
});
export default router;
