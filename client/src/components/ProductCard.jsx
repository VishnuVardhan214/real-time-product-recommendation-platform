import { ShoppingCart, Eye, Heart, Sparkles } from 'lucide-react';

export default function ProductCard({ product, onTrack, recommended = false }) {
  return <article className="product-card">
    <div className="product-image-wrap">
      <img src={product.image} alt={product.name} loading="lazy" onError={e => { e.currentTarget.src = 'https://placehold.co/600x400?text=Product'; }} />
      {recommended && <span className="recommend-badge"><Sparkles size={12}/> For you</span>}
    </div>
    <div className="product-content">
      <span className="category">{product.category}</span>
      <h3>{product.name}</h3>
      <p className="product-description">{product.description}</p>
      <div className="product-bottom"><strong>₹{product.price.toLocaleString('en-IN')}</strong><span className="stock">{product.inventory} in stock</span></div>
      {recommended && product.reason && <p className="reason">{product.reason}</p>}
      <div className="product-actions">
        <button onClick={() => onTrack(product, 'view')} title="View"><Eye size={15}/> View</button>
        <button onClick={() => onTrack(product, 'wishlist')} title="Wishlist"><Heart size={15}/></button>
        <button className="primary-action" onClick={() => onTrack(product, 'cart')}><ShoppingCart size={15}/> Add to cart</button>
      </div>
    </div>
  </article>;
}
