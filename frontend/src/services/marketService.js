const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

//  Helper
async function apiFetch(path) {

  const res = await fetch(`${BASE}/markets${path}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

const marketService = {
  
  getPrices: () => apiFetch('/prices'),

 
  getChart: (holdings = {}) => {
    const holdingsStr = Object.entries(holdings)
      .map(([id, amount]) => `${id}:${amount}`)
      .join(',')
    const query = holdingsStr ? `?holdings=${holdingsStr}` : ''
    return apiFetch(`/chart${query}`)
  },

  
  getMovers: () => apiFetch('/movers'),
}

export default marketService