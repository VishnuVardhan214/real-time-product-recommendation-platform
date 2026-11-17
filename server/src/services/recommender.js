import Interaction from '../models/Interaction.js';
import Product from '../models/Product.js';

const EVENT_WEIGHT = { view: 1, click: 2, wishlist: 3, cart: 4, purchase: 5 };

/**
 * Lightweight online recommender:
 * - Builds a weighted category/tag preference vector from recent interactions.
 * - Adds a small popularity prior so new users still receive useful results.
 * - Excludes products the user has already purchased and recently interacted with.
 * This intentionally keeps the demo explainable and dependency-light.
 */
export async function getRecommendations(userId, limit = 8) {
  const interactions = await Interaction.find({ userId })
    .sort({ occurredAt: -1 }).limit(100).populate('productId').lean();
  const products = await Product.find({ inventory: { $gt: 0 } }).lean();
  if (!products.length) return [];

  const preferences = new Map();
  const seen = new Set();
  const purchased = new Set();
  for (const event of interactions) {
    const product = event.productId;
    if (!product) continue;
    const ageHours = Math.max(0, (Date.now() - new Date(event.occurredAt).getTime()) / 36e5);
    const recency = Math.exp(-ageHours / (24 * 14));
    const weight = (EVENT_WEIGHT[event.eventType] || 1) * recency;
    preferences.set(`category:${product.category}`, (preferences.get(`category:${product.category}`) || 0) + weight);
    for (const tag of product.tags || []) preferences.set(`tag:${tag}`, (preferences.get(`tag:${tag}`) || 0) + weight * 0.7);
    seen.add(String(product._id));
    if (event.eventType === 'purchase') purchased.add(String(product._id));
  }

  const popularity = await Interaction.aggregate([
    { $match: { occurredAt: { $gte: new Date(Date.now() - 30 * 864e5) } } },
    { $group: { _id: '$productId', count: { $sum: 1 } } }
  ]);
  const popularityMap = new Map(popularity.map(x => [String(x._id), x.count]));
  const maxPopularity = Math.max(1, ...popularity.map(x => x.count));

  const ranked = products.filter(p => !purchased.has(String(p._id))).map(product => {
    const categoryScore = preferences.get(`category:${product.category}`) || 0;
    const tagScore = (product.tags || []).reduce((sum, tag) => sum + (preferences.get(`tag:${tag}`) || 0), 0);
    const popularityScore = (popularityMap.get(String(product._id)) || 0) / maxPopularity;
    const noveltyBonus = seen.has(String(product._id)) ? 0 : 0.12;
    const score = categoryScore * 1.4 + tagScore + popularityScore * 0.35 + noveltyBonus;
    const reasons = [];
    if (categoryScore > 0) reasons.push(`Because you explored ${product.category}`);
    if (tagScore > 0) reasons.push('Matches your interests');
    if (popularityScore > 0.5) reasons.push('Popular with shoppers');
    return { ...product, score: Number(score.toFixed(4)), reason: reasons[0] || 'Popular pick' };
  });

  ranked.sort((a, b) => b.score - a.score || a.price - b.price);
  return ranked.slice(0, Math.max(1, Math.min(limit, 30)));
}
