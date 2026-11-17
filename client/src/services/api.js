const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || 'Request failed');
  return body;
}
export const api = {
  products: () => request('/products'),
  users: () => request('/users'),
  recommendations: userId => request(`/recommendations/${userId}`),
  track: payload => request('/interactions', { method: 'POST', body: JSON.stringify(payload) })
};
export const socketUrl = API.replace(/\/api\/?$/, '');
