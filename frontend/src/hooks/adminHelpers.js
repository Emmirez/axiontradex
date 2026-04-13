// Helpers 
export const fmtUSD  = (v) => `$${(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'
export const fmtTime = (d) => d ? new Date(d).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'

export const STATUS_COLOR = {
  active:    '#34d399', suspended: '#f59e0b', banned:    '#f87171',
  pending:   '#f59e0b', completed: '#34d399', failed:    '#f87171',
  cancelled: '#64748b', filled:    '#34d399', open:      '#f59e0b',
}
export const sc = (s) => STATUS_COLOR[s] || '#64748b'