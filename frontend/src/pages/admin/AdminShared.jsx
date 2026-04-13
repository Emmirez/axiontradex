// adminShared.js — shared helpers, re-exported by all section files
import React from 'react'

export const fmtUSD  = (v) => `$${(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'

const STATUS_COLOR = {
  active:'#34d399', suspended:'#f59e0b', banned:'#f87171',
  pending:'#f59e0b', completed:'#34d399', failed:'#f87171',
  cancelled:'#64748b', filled:'#34d399', open:'#f59e0b',
}
export const sc = (s) => STATUS_COLOR[s] || '#64748b'

export function Badge({ status, label }) {
  const c = sc(status)
  return <span style={{ fontSize:'0.68rem', fontWeight:700, padding:'3px 9px', borderRadius:6, background:`${c}15`, color:c, whiteSpace:'nowrap' }}>{label || status}</span>
}

export function Skel({ w='100%', h=14, r=6, dark }) {
  return <div style={{ width:w, height:h, borderRadius:r, background:dark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)', animation:'skPulse 1.4s ease infinite' }} />
}

export function PaginationBar({ page, pages, setPage, border, textClr, muted, divLine }) {
  return (
    <div style={{ padding:'12px 18px', borderTop:`1px solid ${divLine}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ color:muted, fontSize:'0.75rem' }}>Page {page} of {pages}</span>
      <div style={{ display:'flex', gap:8 }}>
        <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
          style={{ padding:'5px 12px', borderRadius:7, border:`1px solid ${border}`, background:'transparent', color:page===1?muted:textClr, cursor:page===1?'not-allowed':'pointer', fontSize:'0.78rem' }}>← Prev</button>
        <button onClick={() => setPage(p=>Math.min(pages,p+1))} disabled={page===pages}
          style={{ padding:'5px 12px', borderRadius:7, border:`1px solid ${border}`, background:'transparent', color:page===pages?muted:textClr, cursor:page===pages?'not-allowed':'pointer', fontSize:'0.78rem' }}>Next →</button>
      </div>
    </div>
  )
}