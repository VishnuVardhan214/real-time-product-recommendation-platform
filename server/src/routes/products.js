import { Router } from 'express';
import Product from '../models/Product.js';
const router = Router();
router.get('/', async (_req, res, next) => {
  try { res.json(await Product.find({ inventory: { $gt: 0 } }).sort({ category: 1, name: 1 }).lean()); }
  catch (err) { next(err); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
});
export default router;
