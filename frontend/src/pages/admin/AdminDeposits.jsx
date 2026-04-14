/**
 * AdminDeposits.jsx
 * Route: /admin/deposits
 *
 * Features:
 *  - View all deposit requests with filters (status, method, search)
 *  - Approve → credits user balance
 *  - Reject → marks failed with note
 *  - Edit modal → change any field (amount, currency, status, txHash, network, note)
 *  - View receipt image/file
 *  - Stats cards: total pending, total approved today, total volume
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Search, Filter, CheckCircle, XCircle, Edit3,
  Eye, RefreshCw, ChevronDown, X, AlertCircle,
  Download, Clock, TrendingUp, DollarSign, FileText,
  User, Calendar, Hash, Globe, CreditCard, StickyNote,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../services/apiService'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtUSD  = (v) => `$${(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'
const fmtShort= (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'

const STATUS_CFG = {
  pending:   { color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  label:'Pending'   },
  completed: { color:'#34d399', bg:'rgba(52,211,153,0.12)',  label:'Approved'  },
  failed:    { color:'#f87171', bg:'rgba(248,113,113,0.12)', label:'Rejected'  },
  cancelled: { color:'#64748b', bg:'rgba(100,116,139,0.12)', label:'Cancelled' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub, darkMode }) {
  const cardBg = darkMode ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.98)'
  const border = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const textClr= darkMode ? '#f1f5f9' : '#0f172a'
  const muted  = darkMode ? '#64748b' : '#94a3b8'
  return (
    <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:16, padding:'18px 20px', display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ width:42, height:42, borderRadius:12, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon style={{ width:18, height:18, color }} />
      </div>
      <div>
        <div style={{ color:muted, fontSize:'0.7rem', marginBottom:3 }}>{label}</div>
        <div style={{ color:textClr, fontWeight:800, fontSize:'1.15rem', fontFamily:'monospace' }}>{value}</div>
        {sub && <div style={{ color:muted, fontSize:'0.68rem', marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  )
}

function Badge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending
  return (
    <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'3px 10px', borderRadius:6, background:cfg.bg, color:cfg.color, whiteSpace:'nowrap' }}>
      {cfg.label}
    </span>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ deposit, onClose, onSave, darkMode }) {
  const [form, setForm] = useState({
    status:   deposit.status   || 'pending',
    amount:   deposit.amount   || '',
    currency: deposit.currency || 'USDT',
    txHash:   deposit.txHash   || '',
    network:  deposit.network  || '',
    note:     deposit.note     || '',
  })
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const cardBg  = darkMode ? 'rgba(10,16,35,0.99)'     : '#ffffff'
  const textClr = darkMode ? '#f1f5f9'                   : '#0f172a'
  const muted   = darkMode ? '#64748b'                   : '#94a3b8'
  const border  = darkMode ? 'rgba(255,255,255,0.08)'   : 'rgba(0,0,0,0.09)'
  const inputBg = darkMode ? 'rgba(255,255,255,0.05)'   : 'rgba(0,0,0,0.03)'
  const divLine = darkMode ? 'rgba(255,255,255,0.05)'   : 'rgba(0,0,0,0.06)'

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await onSave(deposit._id, form)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ icon: Icon, label, children }) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'flex', alignItems:'center', gap:6, color:muted, fontSize:'0.72rem', fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>
        <Icon style={{ width:11, height:11 }} />{label}
      </label>
      {children}
    </div>
  )

  const inputStyle = { width:'100%', padding:'10px 12px', borderRadius:9, border:`1px solid ${border}`, background:inputBg, color:textClr, fontSize:'0.875rem', boxSizing:'border-box', fontFamily:'monospace', outline:'none' }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }} onClick={onClose} />

      <div style={{ position:'relative', zIndex:1, background:cardBg, border:`1px solid ${border}`, borderRadius:22, padding:'28px', width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 60px rgba(0,0,0,0.4)' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
          <div>
            <div style={{ color:textClr, fontWeight:800, fontSize:'1.1rem', marginBottom:4 }}>Edit Deposit</div>
            <div style={{ color:muted, fontSize:'0.75rem', fontFamily:'monospace' }}>
              {deposit.reference || deposit._id?.slice(-12)}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:muted, cursor:'pointer', padding:4 }}>
            <X style={{ width:18, height:18 }} />
          </button>
        </div>

        {/* User info (read only) */}
        <div style={{ background: darkMode?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)', border:`1px solid ${divLine}`, borderRadius:12, padding:'12px 14px', marginBottom:20 }}>
          <div style={{ color:muted, fontSize:'0.68rem', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>User</div>
          <div style={{ color:textClr, fontWeight:600, fontSize:'0.875rem' }}>
            {deposit.user?.firstName} {deposit.user?.lastName}
          </div>
          <div style={{ color:muted, fontSize:'0.78rem' }}>{deposit.user?.email}</div>
        </div>

        <div style={{ borderBottom:`1px solid ${divLine}`, marginBottom:18 }} />

        {/* Editable fields */}
        <Field icon={CreditCard} label="Status">
          <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
            style={{ ...inputStyle, cursor:'pointer' }}>
            <option value="pending">Pending</option>
            <option value="completed">Completed (Approve)</option>
            <option value="failed">Failed (Reject)</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </Field>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <Field icon={DollarSign} label="Amount">
            <input style={inputStyle} type="number" step="any" min="0"
              value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} />
          </Field>
          <Field icon={Globe} label="Currency">
            <select value={form.currency} onChange={e=>setForm(f=>({...f,currency:e.target.value}))}
              style={{ ...inputStyle, cursor:'pointer' }}>
              {['USDT','BTC','ETH','BNB','SOL','USD'].map(c=>(
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field icon={Hash} label="TX Hash / Reference">
          <input style={inputStyle} type="text" placeholder="0x... or payment reference"
            value={form.txHash} onChange={e=>setForm(f=>({...f,txHash:e.target.value}))} />
        </Field>

        <Field icon={Globe} label="Network">
          <input style={inputStyle} type="text" placeholder="TRC20, ERC20, BEP20, bank_transfer..."
            value={form.network} onChange={e=>setForm(f=>({...f,network:e.target.value}))} />
        </Field>

        <Field icon={StickyNote} label="Admin Note">
          <textarea style={{ ...inputStyle, height:80, resize:'vertical', fontFamily:'inherit' }}
            placeholder="Internal note visible to admins only..."
            value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} />
        </Field>

        {/* Status change warning */}
        {form.status === 'completed' && deposit.status !== 'completed' && (
          <div style={{ display:'flex', gap:8, padding:'10px 12px', borderRadius:10, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', marginBottom:14 }}>
            <CheckCircle style={{ width:14, height:14, color:'#34d399', flexShrink:0 }} />
            <span style={{ color:'#34d399', fontSize:'0.75rem' }}>
              Approving will credit <strong>{form.amount} {form.currency}</strong> to user's balance.
            </span>
          </div>
        )}
        {form.status === 'failed' && deposit.status !== 'failed' && (
          <div style={{ display:'flex', gap:8, padding:'10px 12px', borderRadius:10, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', marginBottom:14 }}>
            <XCircle style={{ width:14, height:14, color:'#f87171', flexShrink:0 }} />
            <span style={{ color:'#f87171', fontSize:'0.75rem' }}>
              Rejecting will mark this deposit as failed. No balance changes.
            </span>
          </div>
        )}

        {error && (
          <div style={{ display:'flex', gap:8, padding:'10px 12px', borderRadius:10, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', marginBottom:14 }}>
            <AlertCircle style={{ width:14, height:14, color:'#f87171', flexShrink:0 }} />
            <span style={{ color:'#f87171', fontSize:'0.78rem' }}>{error}</span>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <button onClick={onClose}
            style={{ padding:'11px', borderRadius:10, border:`1px solid ${border}`, background:'transparent', color:textClr, fontWeight:600, fontSize:'0.85rem', cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding:'11px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#d97706,#f59e0b)', color:'#020617', fontWeight:800, fontSize:'0.85rem', cursor:saving?'not-allowed':'pointer', opacity:saving?0.7:1 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Receipt Viewer Modal ─────────────────────────────────────────────────────
function ReceiptModal({ url, onClose, darkMode }) {
  const isPdf = url?.toLowerCase().endsWith('.pdf')
  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)' }} onClick={onClose} />
      <div style={{ position:'relative', zIndex:1, background: darkMode?'rgba(10,16,35,0.99)':'#fff', borderRadius:20, padding:20, maxWidth:600, width:'100%', maxHeight:'85vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <span style={{ color: darkMode?'#f1f5f9':'#0f172a', fontWeight:700 }}>Deposit Receipt</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color: darkMode?'#64748b':'#94a3b8', cursor:'pointer' }}>
            <X style={{ width:18, height:18 }} />
          </button>
        </div>
        {isPdf ? (
          <iframe src={`http://localhost:5000/${url}`} style={{ flex:1, border:'none', borderRadius:10, minHeight:400 }} title="receipt" />
        ) : (
          <img src={`http://localhost:5000/${url}`} alt="receipt" style={{ maxWidth:'100%', maxHeight:'70vh', objectFit:'contain', borderRadius:10 }} />
        )}
        <a href={`http://localhost:5000/${url}`} download target="_blank" rel="noreferrer"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:12, padding:'9px', borderRadius:10, background:'rgba(245,158,11,0.12)', color:'#f59e0b', fontSize:'0.82rem', fontWeight:700, textDecoration:'none' }}>
          <Download style={{ width:13, height:13 }} /> Download
        </a>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDeposits() {
  const { darkMode } = useTheme()

  const [deposits,      setDeposits]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [stats,         setStats]         = useState({ pending:0, approvedToday:0, totalVolume:0, totalCount:0 })
  const [filterStatus,  setFilterStatus]  = useState('all')
  const [filterMethod,  setFilterMethod]  = useState('all')
  const [search,        setSearch]        = useState('')
  const [page,          setPage]          = useState(1)
  const [totalPages,    setTotalPages]    = useState(1)
  const [editDeposit,   setEditDeposit]   = useState(null)
  const [receiptUrl,    setReceiptUrl]    = useState(null)
  const [actionLoading, setActionLoading] = useState(null) // txn id being actioned
  const [toast,         setToast]         = useState(null)

  // theme
  const pageBg  = darkMode ? '#020617'                  : '#f1f5f9'
  const cardBg  = darkMode ? 'rgba(15,23,42,0.9)'       : 'rgba(255,255,255,0.98)'
  const textClr = darkMode ? '#f1f5f9'                   : '#0f172a'
  const muted   = darkMode ? '#64748b'                   : '#94a3b8'
  const border  = darkMode ? 'rgba(255,255,255,0.07)'   : 'rgba(0,0,0,0.07)'
  const divLine = darkMode ? 'rgba(255,255,255,0.05)'   : 'rgba(0,0,0,0.06)'
  const inputBg = darkMode ? 'rgba(255,255,255,0.05)'   : 'rgba(0,0,0,0.03)'
  const hoverBg = darkMode ? 'rgba(255,255,255,0.025)'  : 'rgba(0,0,0,0.02)'

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch deposits ─────────────────────────────────────────────────────────
  const fetchDeposits = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type:'deposit', page, limit:20 })
      if (filterStatus !== 'all') params.set('status', filterStatus)

      const res = await api.get(`/admin/transactions?${params}`)
      const data = res.data?.data || []
      const meta = res.data?.pagination || {}

      setDeposits(data)
      setTotalPages(meta.pages || 1)

      // Compute stats from this page + totals
      const pending       = data.filter(d => d.status === 'pending').length
      const today         = new Date().toDateString()
      const approvedToday = data.filter(d => d.status === 'completed' && new Date(d.processedAt).toDateString() === today).length
      const totalVol      = data.filter(d => d.status === 'completed').reduce((s,d) => s + d.amount, 0)
      setStats(prev => ({ ...prev, pending, approvedToday, totalVolume: totalVol, totalCount: meta.total || data.length }))

    } catch (err) {
      console.error('[AdminDeposits]', err.message)
    } finally {
      setLoading(false)
    }
  }, [filterStatus, page])

  useEffect(() => { fetchDeposits() }, [fetchDeposits])

  // ── Quick approve ──────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActionLoading(id)
    try {
      await api.post(`/admin/transactions/${id}/approve-deposit`, { note: 'Approved by admin' })
      showToast('Deposit approved — balance credited')
      fetchDeposits()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // ── Quick reject ───────────────────────────────────────────────────────────
  const handleReject = async (id) => {
    const note = window.prompt('Reason for rejection (optional):') ?? ''
    setActionLoading(id)
    try {
      await api.post(`/admin/transactions/${id}/reject-deposit`, { note })
      showToast('Deposit rejected')
      fetchDeposits()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // ── Edit save ──────────────────────────────────────────────────────────────
  const handleEditSave = async (id, form) => {
    await api.patch(`/admin/transactions/${id}`, form)
    showToast('Deposit updated successfully')
    fetchDeposits()
  }

  // ── Filter + search ────────────────────────────────────────────────────────
  const displayed = deposits.filter(d => {
    if (filterMethod !== 'all') {
      const isBank = d.network === 'bank_transfer' || d.note?.includes('Bank')
      if (filterMethod === 'bank'   && !isBank)  return false
      if (filterMethod === 'crypto' && isBank)   return false
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      const name = `${d.user?.firstName} ${d.user?.lastName}`.toLowerCase()
      return name.includes(q) || d.user?.email?.toLowerCase().includes(q) ||
             d.txHash?.toLowerCase().includes(q) || d.reference?.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div style={{ minHeight:'100vh', background:pageBg }}>
      <style>{`
        @keyframes toastIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .dep-row:hover { background: ${hoverBg} !important; }
        .dep-row { transition: background 0.12s; }
        .act-btn:hover { opacity: 0.85 !important; }
        .thin-scroll::-webkit-scrollbar{width:3px;height:3px}
        .thin-scroll::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.25);border-radius:99px}
        .thin-scroll{scrollbar-width:thin;scrollbar-color:rgba(245,158,11,0.25) transparent}
        .filter-btn:hover { border-color:rgba(245,158,11,0.4)!important; }
        input:focus,select:focus { outline:none; border-color:rgba(245,158,11,0.5)!important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:30, right:30, zIndex:400, padding:'12px 20px', borderRadius:12, background: toast.type==='error'?'rgba(248,113,113,0.95)':'rgba(52,211,153,0.95)', color:'#fff', fontWeight:700, fontSize:'0.85rem', boxShadow:'0 8px 30px rgba(0,0,0,0.3)', animation:'toastIn 0.25s ease', whiteSpace:'nowrap' }}>
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {editDeposit  && <EditModal deposit={editDeposit} onClose={() => setEditDeposit(null)} onSave={handleEditSave} darkMode={darkMode} />}
      {receiptUrl   && <ReceiptModal url={receiptUrl} onClose={() => setReceiptUrl(null)} darkMode={darkMode} />}

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'28px 24px' }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:12, marginBottom:24, animation:'fadeUp 0.3s ease' }}>
          <div>
            <h1 style={{ fontFamily:'"Playfair Display",serif', fontWeight:800, fontSize:'clamp(1.5rem,3vw,2rem)', color:textClr, marginBottom:4 }}>
              Deposit Management
            </h1>
            <p style={{ color:muted, fontSize:'0.875rem' }}>Review, approve and edit all user deposit requests</p>
          </div>
          <button onClick={fetchDeposits}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, border:`1px solid ${border}`, background:'transparent', color:muted, fontSize:'0.78rem', cursor:'pointer' }}>
            <RefreshCw style={{ width:12, height:12 }} /> Refresh
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:24, animation:'fadeUp 0.35s ease' }}>
          <StatCard icon={Clock}       label="Pending Review"   value={stats.pending}       color="#f59e0b" darkMode={darkMode} />
          <StatCard icon={CheckCircle} label="Approved Today"   value={stats.approvedToday} color="#34d399" darkMode={darkMode} />
          <StatCard icon={DollarSign}  label="Volume (page)"    value={fmtUSD(stats.totalVolume)} color="#60a5fa" darkMode={darkMode} />
          <StatCard icon={FileText}    label="Total Deposits"   value={stats.totalCount}    color="#a78bfa" darkMode={darkMode} />
        </div>

        {/* ── Filters ── */}
        <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:18, padding:'14px 18px', marginBottom:16, display:'flex', flexWrap:'wrap', gap:12, alignItems:'center' }}>
          {/* Search */}
          <div style={{ position:'relative', flex:'1 1 220px', maxWidth:300 }}>
            <Search style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:13, height:13, color:muted, pointerEvents:'none' }} />
            <input type="text" placeholder="Search user, email, TX hash…"
              value={search} onChange={e=>setSearch(e.target.value)}
              style={{ width:'100%', padding:'9px 12px 9px 32px', borderRadius:9, border:`1px solid ${border}`, background:inputBg, color:textClr, fontSize:'0.82rem', boxSizing:'border-box' }} />
          </div>

          {/* Status filter */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['all','pending','completed','failed'].map(s => (
              <button key={s} className="filter-btn"
                onClick={() => { setFilterStatus(s); setPage(1) }}
                style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${filterStatus===s?'#f59e0b':border}`, background:filterStatus===s?'rgba(245,158,11,0.1)':'transparent', color:filterStatus===s?'#f59e0b':muted, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', textTransform:'capitalize', transition:'all 0.15s' }}>
                {s === 'all' ? 'All Status' : s === 'completed' ? 'Approved' : s === 'failed' ? 'Rejected' : 'Pending'}
              </button>
            ))}
          </div>

          {/* Method filter */}
          <div style={{ display:'flex', gap:6 }}>
            {['all','crypto','bank'].map(m => (
              <button key={m} className="filter-btn"
                onClick={() => setFilterMethod(m)}
                style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${filterMethod===m?'#60a5fa':border}`, background:filterMethod===m?'rgba(96,165,250,0.1)':'transparent', color:filterMethod===m?'#60a5fa':muted, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>
                {m === 'all' ? 'All Methods' : m === 'bank' ? 'Bank' : 'Crypto'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ background:cardBg, border:`1px solid ${border}`, borderRadius:18, overflow:'hidden' }}>
          <div className="thin-scroll" style={{ overflowX:'auto' }}>
            <div style={{ minWidth:900 }}>

              {/* Header */}
              <div style={{ display:'grid', gridTemplateColumns:'160px 180px 90px 100px 130px 110px 120px 130px', gap:8, padding:'11px 20px', color:muted, fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', borderBottom:`1px solid ${divLine}`, whiteSpace:'nowrap' }}>
                <div>Date</div>
                <div>User</div>
                <div>Amount</div>
                <div>Currency</div>
                <div>Method / Network</div>
                <div>Receipt</div>
                <div>Status</div>
                <div style={{ textAlign:'right' }}>Actions</div>
              </div>

              {/* Rows */}
              {loading ? (
                Array.from({length:6}).map((_,i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'160px 180px 90px 100px 130px 110px 120px 130px', gap:8, padding:'14px 20px', borderBottom:`1px solid ${divLine}` }}>
                    {Array.from({length:8}).map((_,j) => (
                      <div key={j} style={{ height:14, borderRadius:4, background: darkMode?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)', animation:'fadeUp 1.4s ease infinite' }} />
                    ))}
                  </div>
                ))
              ) : displayed.length === 0 ? (
                <div style={{ padding:'40px 20px', textAlign:'center', color:muted, fontSize:'0.85rem' }}>
                  No deposits match your filters.
                </div>
              ) : displayed.map((d, i) => {
                const isBank   = d.network === 'bank_transfer' || d.note?.includes('Bank')
                const isLoading= actionLoading === d._id
                return (
                  <div key={d._id} className="dep-row"
                    style={{ display:'grid', gridTemplateColumns:'160px 180px 90px 100px 130px 110px 120px 130px', gap:8, padding:'13px 20px', borderBottom: i<displayed.length-1?`1px solid ${divLine}`:'none', alignItems:'center', whiteSpace:'nowrap' }}>

                    {/* Date */}
                    <div style={{ color:muted, fontSize:'0.75rem' }}>{fmtShort(d.createdAt)}</div>

                    {/* User */}
                    <div>
                      <div style={{ color:textClr, fontWeight:600, fontSize:'0.82rem' }}>
                        {d.user?.firstName} {d.user?.lastName}
                      </div>
                      <div style={{ color:muted, fontSize:'0.7rem', overflow:'hidden', textOverflow:'ellipsis', maxWidth:170 }}>{d.user?.email}</div>
                    </div>

                    {/* Amount */}
                    <div style={{ color:textClr, fontFamily:'monospace', fontWeight:700, fontSize:'0.85rem' }}>
                      {d.amount?.toLocaleString('en-US',{maximumFractionDigits:8})}
                    </div>

                    {/* Currency */}
                    <div style={{ color:muted, fontFamily:'monospace', fontSize:'0.82rem' }}>{d.currency}</div>

                    {/* Method / Network */}
                    <div>
                      <div style={{ fontSize:'0.72rem', fontWeight:700, padding:'2px 8px', borderRadius:5, background: isBank?'rgba(96,165,250,0.12)':'rgba(245,158,11,0.1)', color: isBank?'#60a5fa':'#f59e0b', display:'inline-block', marginBottom:2 }}>
                        {isBank ? 'Bank' : 'Crypto'}
                      </div>
                      <div style={{ color:muted, fontSize:'0.7rem' }}>{d.network || '—'}</div>
                    </div>

                    {/* Receipt */}
                    <div>
                      {d.receipt ? (
                        <button onClick={() => setReceiptUrl(d.receipt)}
                          style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:7, border:`1px solid ${border}`, background:'transparent', color:'#60a5fa', fontSize:'0.72rem', fontWeight:600, cursor:'pointer' }}>
                          <Eye style={{ width:11, height:11 }} /> View
                        </button>
                      ) : (
                        <span style={{ color:muted, fontSize:'0.72rem' }}>None</span>
                      )}
                    </div>

                    {/* Status */}
                    <div><Badge status={d.status} /></div>

                    {/* Actions */}
                    <div style={{ display:'flex', gap:5, justifyContent:'flex-end' }}>
                      {/* Edit */}
                      <button className="act-btn" onClick={() => setEditDeposit(d)}
                        style={{ padding:'5px 8px', borderRadius:7, border:`1px solid ${border}`, background:'transparent', color:muted, cursor:'pointer', display:'flex', alignItems:'center' }}
                        title="Edit deposit">
                        <Edit3 style={{ width:12, height:12 }} />
                      </button>

                      {/* Approve — only if pending */}
                      {d.status === 'pending' && (
                        <button className="act-btn" onClick={() => handleApprove(d._id)}
                          disabled={isLoading}
                          style={{ padding:'5px 10px', borderRadius:7, border:'1px solid rgba(52,211,153,0.4)', background:'rgba(52,211,153,0.1)', color:'#34d399', fontSize:'0.7rem', fontWeight:700, cursor:isLoading?'not-allowed':'pointer', opacity:isLoading?0.5:1, display:'flex', alignItems:'center', gap:4 }}>
                          {isLoading ? '…' : <><CheckCircle style={{ width:11, height:11 }} /> Approve</>}
                        </button>
                      )}

                      {/* Reject — only if pending */}
                      {d.status === 'pending' && (
                        <button className="act-btn" onClick={() => handleReject(d._id)}
                          disabled={isLoading}
                          style={{ padding:'5px 10px', borderRadius:7, border:'1px solid rgba(248,113,113,0.4)', background:'rgba(248,113,113,0.08)', color:'#f87171', fontSize:'0.7rem', fontWeight:700, cursor:isLoading?'not-allowed':'pointer', opacity:isLoading?0.5:1, display:'flex', alignItems:'center', gap:4 }}>
                          {isLoading ? '…' : <><XCircle style={{ width:11, height:11 }} /> Reject</>}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding:'14px 20px', borderTop:`1px solid ${divLine}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:muted, fontSize:'0.75rem' }}>Page {page} of {totalPages}</span>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${border}`, background:'transparent', color:page===1?muted:textClr, cursor:page===1?'not-allowed':'pointer', fontSize:'0.78rem' }}>
                  ← Prev
                </button>
                <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${border}`, background:'transparent', color:page===totalPages?muted:textClr, cursor:page===totalPages?'not-allowed':'pointer', fontSize:'0.78rem' }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}