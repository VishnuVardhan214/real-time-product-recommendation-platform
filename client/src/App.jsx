import { useCallback, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Activity, ArrowUpRight, RefreshCw, Radio, Search, ShoppingBag, Sparkles, Users } from 'lucide-react';
import ProductCard from './components/ProductCard';
import { api, socketUrl } from './services/api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('Connecting…');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [eventCount, setEventCount] = useState(0);
  const [error, setError] = useState('');

  const refreshRecommendations = useCallback(async (id = userId) => {
    if (!id) return;
    try { setRecommendations(await api.recommendations(id)); setLastUpdate(new Date()); }
    catch (err) { setError(err.message); }
  }, [userId]);

  useEffect(() => {
    Promise.all([api.products(), api.users()]).then(([p, u]) => {
      setProducts(p); setUsers(u);
      if (u.length) setUserId(current => current || u[0]._id);
    }).catch(err => setError(err.message));
  }, []);

  useEffect(() => {
    if (!userId) return;
    refreshRecommendations(userId);
  }, [userId, refreshRecommendations]);

  useEffect(() => {
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setStatus('Live connection'));
    socket.on('disconnect', () => setStatus('Reconnecting…'));
    socket.on('recommendations:updated', payload => {
      if (payload.userId === userId) { setRecommendations(payload.recommendations); setLastUpdate(new Date(payload.processedAt)); }
    });
    socket.on('interaction:processed', payload => { if (payload.userId === userId) setEventCount(n => n + 1); });
    return () => socket.disconnect();
  }, [userId]);

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);
  const filtered = products.filter(p => (category === 'All' || p.category === category) && `${p.name} ${p.description} ${p.tags?.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const selectedUser = users.find(u => u._id === userId);

  async function track(product, eventType) {
    try {
      await api.track({ userId, productId: product._id, eventType });
      setError('');
    } catch (err) { setError(err.message); }
  }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><Sparkles size={19}/></span> pulse<span className="brand-dot">.</span></a><div className="topbar-right"><span className="live-indicator"><i/> {status}</span><span className="topbar-label">REAL-TIME COMMERCE DEMO</span></div></header>
    <main id="top" className="main-content">
      <section className="hero">
        <div className="hero-copy"><span className="eyebrow"><span/> PERSONALIZED DISCOVERY ENGINE</span><h1>Good finds.<br/><em>Right on time.</em></h1><p>A live product discovery experience that learns from every interaction and refreshes recommendations as events stream in.</p><div className="hero-meta"><span><Radio size={15}/> MQTT event stream</span><span><Activity size={15}/> Live recommendations</span></div></div>
        <div className="hero-panel"><div className="panel-orbit orbit-one"/><div className="panel-orbit orbit-two"/><div className="panel-core"><Sparkles size={30}/></div><div className="floating-chip chip-one"><span className="chip-dot"/> Event received</div><div className="floating-chip chip-two"><ArrowUpRight size={15}/> Match updated</div><div className="panel-caption">EVENT → INSIGHT → DISCOVERY</div></div>
      </section>

      <section className="stats-row">
        <div className="stat-card"><span className="stat-icon"><ShoppingBag size={17}/></span><div><strong>{products.length}</strong><small>Catalog products</small></div></div>
        <div className="stat-card"><span className="stat-icon"><Users size={17}/></span><div><strong>{users.length}</strong><small>Demo profiles</small></div></div>
        <div className="stat-card"><span className="stat-icon"><Activity size={17}/></span><div><strong>{eventCount}</strong><small>Live events processed</small></div></div>
        <div className="stat-card update-stat"><span className="stat-icon"><RefreshCw size={17}/></span><div><strong>{lastUpdate ? lastUpdate.toLocaleTimeString() : '—'}</strong><small>Last recommendation refresh</small></div></div>
      </section>

      {error && <div className="error-banner">{error}</div>}
      <section className="recommendation-section">
        <div className="section-heading"><div><span className="eyebrow">YOUR SIGNALS, YOUR PICKS</span><h2>Picked for you <Sparkles size={20}/></h2><p>Recommendations update automatically when the selected shopper interacts.</p></div><div className="user-picker"><label htmlFor="user-select">Viewing as</label><select id="user-select" value={userId} onChange={e => setUserId(e.target.value)}>{users.map(u => <option key={u._id} value={u._id}>{u.displayName}</option>)}</select></div></div>
        <div className="recommendation-grid">{recommendations.length ? recommendations.slice(0, 4).map(p => <ProductCard key={p._id} product={p} recommended onTrack={track}/>) : <div className="empty-state">{selectedUser ? 'Explore a few products below to build a personal recommendation profile.' : 'Loading recommendations…'}</div>}</div>
      </section>

      <section className="catalog-section"><div className="section-heading catalog-heading"><div><span className="eyebrow">THE COLLECTION</span><h2>Explore the catalog</h2><p>Every view, wishlist and cart action becomes a streaming event.</p></div><div className="catalog-tools"><div className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products…"/></div><select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter category">{categories.map(c => <option key={c}>{c}</option>)}</select></div></div>
        <div className="catalog-grid">{filtered.map(p => <ProductCard key={p._id} product={p} onTrack={track}/>)}</div>
        {!filtered.length && <div className="empty-state">No products match your search.</div>}
      </section>
    </main>
    <footer><span>pulse<span className="brand-dot">.</span> — Real-time recommendation platform</span><span>Built with MERN + MQTT</span></footer>
  </div>;
}
