import React, { useState } from 'react'
import { X } from 'lucide-react'
import api from '../../services/apiService'

export default function AdminOpenTradeModal({ onClose, onSuccess, showToast, darkMode, cardBg, textClr, muted, border, divLine, inputBg }) {
  const [form, setForm] = useState({ userId: '', symbol: 'BTCUSDT', side: 'buy', type: 'market', quantity: '', price: '', note: '' })
  const [saving, setSaving] = useState(false)

  const iStyle = {
    width: '100%',
    padding: '9px 11px',
    borderRadius: 8,
    border: `1px solid ${border}`,
    background: inputBg,
    color: textClr,
    fontSize: '0.85rem',
    boxSizing: 'border-box',
  }

  const submit = async () => {
    if (!form.userId || !form.quantity || !form.price) { showToast('Fill all required fields', 'error'); return }
    setSaving(true)
    try {
      await api.post('/admin/trades', { ...form, quantity: parseFloat(form.quantity), price: parseFloat(form.price) })
      showToast('Trade opened for user')
      onSuccess()
    } catch (err) { showToast(err.response?.data?.message || 'Failed', 'error') }
    finally { setSaving(false) }
  }

  return (
    /* ── Backdrop + centering ── */
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 400,
      display: 'flex',
      alignItems: 'flex-end',   // sheet from bottom on mobile
      justifyContent: 'center',
      padding: 0,
    }}>
      {/* Dimmed backdrop */}
      <div inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal sheet */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: cardBg,
        border: `1px solid ${border}`,
        /* rounded top corners only — bottom sheet feel on mobile */
        borderRadius: '20px 20px 0 0',
        width: '100%',
        maxWidth: 440,
        /* scroll if content taller than viewport */
        maxHeight: '92dvh',
        overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.35)',
        padding: '20px 20px 32px',
        boxSizing: 'border-box',
        /* center on desktop by overriding the parent's align-items */
        margin: '0 auto',
      }}>

        {/* Drag handle — visual affordance on mobile */}
        <div style={{
          width: 36,
          height: 4,
          borderRadius: 99,
          background: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
          margin: '0 auto 16px',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ color: textClr, fontWeight: 800, fontSize: '1rem' }}>Open Trade for User</div>
          <button
            onClick={onClose}
            style={{
              background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${border}`,
              borderRadius: 8,
              color: muted,
              cursor: 'pointer',
              padding: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {/* Fields */}
        {[
          { key: 'userId',   label: 'USER ID',  type: 'text',   ph: 'MongoDB user _id' },
          { key: 'symbol',   label: 'SYMBOL',   type: 'text',   ph: 'BTCUSDT' },
          { key: 'quantity', label: 'QUANTITY', type: 'number', ph: '0.01' },
          { key: 'price',    label: 'PRICE',    type: 'number', ph: '87000' },
          { key: 'note',     label: 'NOTE',     type: 'text',   ph: 'Admin note…' },
        ].map(({ key, label, type, ph }) => (
          <div key={key} style={{ marginBottom: 10 }}>
            <label style={{ color: muted, fontSize: '0.7rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>{label}</label>
            <input
              style={iStyle}
              type={type}
              placeholder={ph}
              value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            />
          </div>
        ))}

        {/* Side + Type selects */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          {[
            { key: 'side', opts: ['buy', 'sell'] },
            { key: 'type', opts: ['market', 'limit', 'stop'] },
          ].map(({ key, opts }) => (
            <div key={key}>
              <label style={{ color: muted, fontSize: '0.7rem', fontWeight: 600, display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>{key}</label>
              <select
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{ ...iStyle, cursor: 'pointer' }}
              >
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Side indicator pill */}
        <div style={{
          padding: '8px 12px',
          borderRadius: 8,
          marginBottom: 14,
          background: form.side === 'buy' ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
          border: `1px solid ${form.side === 'buy' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
          color: form.side === 'buy' ? '#34d399' : '#f87171',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}>
          {form.side === 'buy' ? '▲ Long (Buy)' : '▼ Short (Sell)'} · {form.type} order
          {form.quantity && form.price ? ` · ${form.quantity} × $${parseFloat(form.price).toLocaleString()} = $${(parseFloat(form.quantity) * parseFloat(form.price)).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : ''}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ padding: '11px', borderRadius: 9, border: `1px solid ${border}`, background: 'transparent', color: textClr, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            style={{ padding: '11px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Opening…' : 'Open Trade'}
          </button>
        </div>
      </div>
    </div>
  )
}