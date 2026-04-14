import React, { useState, useEffect, useCallback } from 'react'
import {
  Save, RefreshCw, CheckCircle, AlertCircle,
  Eye, EyeOff, Copy, ChevronDown, ChevronUp,
  Building2, Bitcoin, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import api from '../../services/apiService'

const COIN_META = {
  USDT: { color: '#26a17b', image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  BTC:  { color: '#f7931a', image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
  ETH:  { color: '#627eea', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  BNB:  { color: '#f0b90b', image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
  SOL:  { color: '#9945ff', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
}

export default function AdminDepositSettings() {
  const { darkMode } = useTheme()

  const [coins,       setCoins]       = useState([])
  const [bank,        setBank]        = useState({})
  const [loading,     setLoading]     = useState(true)
  const [savingCoins, setSavingCoins] = useState(false)
  const [savingBank,  setSavingBank]  = useState(false)
  const [toast,       setToast]       = useState(null)
  const [expanded,    setExpanded]    = useState({}) // { coinId: bool }

  // theme
  const pageBg  = darkMode ? '#020617'                 : '#f1f5f9'
  const cardBg  = darkMode ? 'rgba(15,23,42,0.9)'      : 'rgba(255,255,255,0.98)'
  const textClr = darkMode ? '#f1f5f9'                  : '#0f172a'
  const muted   = darkMode ? '#64748b'                  : '#94a3b8'
  const border  = darkMode ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.08)'
  const divLine = darkMode ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.06)'
  const inputBg = darkMode ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.03)'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch current settings ─────────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await api.get('/admin/deposit-settings')
      const data = res.data?.data?.settings
      setCoins(JSON.parse(JSON.stringify(data?.coins || []))) // deep clone
      setBank(data?.bank  || {})
      // Expand all coins by default
      const exp = {}
      ;(data?.coins || []).forEach(c => { exp[c.id] = true })
      setExpanded(exp)
    } catch (err) {
      showToast('Failed to load settings', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  // ── Update coin address locally ────────────────────────────────────────────
  const updateNetworkAddr = (coinId, networkId, field, value) => {
    setCoins(prev => prev.map(c => {
      if (c.id !== coinId) return c
      return {
        ...c,
        networks: c.networks.map(n => {
          if (n.id !== networkId) return n
          return { ...n, [field]: value }
        }),
      }
    }))
  }

  const toggleCoin = (coinId) => {
    setCoins(prev => prev.map(c => c.id === coinId ? { ...c, enabled: !c.enabled } : c))
  }

  const toggleNetwork = (coinId, networkId) => {
    setCoins(prev => prev.map(c => {
      if (c.id !== coinId) return c
      return { ...c, networks: c.networks.map(n => n.id === networkId ? { ...n, enabled: !n.enabled } : n) }
    }))
  }

  // ── Save coins ─────────────────────────────────────────────────────────────
  const saveCoins = async () => {
    setSavingCoins(true)
    try {
      await api.patch('/admin/deposit-settings/coins', { coins })
      showToast('Wallet addresses saved successfully')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setSavingCoins(false)
    }
  }

  // ── Save bank ──────────────────────────────────────────────────────────────
  const saveBank = async () => {
    setSavingBank(true)
    try {
      await api.patch('/admin/deposit-settings/bank', bank)
      showToast('Bank details saved successfully')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error')
    } finally {
      setSavingBank(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 9,
    border: `1px solid ${border}`, background: inputBg,
    color: textClr, fontSize: '0.875rem', boxSizing: 'border-box',
    fontFamily: 'monospace', outline: 'none', transition: 'border-color 0.2s',
  }

  const labelStyle = { color: muted, fontSize: '0.72rem', fontWeight: 600, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw style={{ width: 28, height: 28, color: '#f59e0b', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: pageBg }}>
      <style>{`
        .settings-input:focus { border-color: rgba(245,158,11,0.5) !important; }
        @keyframes toastIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 400, padding: '12px 20px', borderRadius: 12, background: toast.type === 'error' ? 'rgba(248,113,113,0.95)' : 'rgba(52,211,153,0.95)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', animation: 'toastIn 0.25s ease', whiteSpace: 'nowrap' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,1.9rem)', color: textClr, marginBottom: 4 }}>
              Deposit Settings
            </h1>
            <p style={{ color: muted, fontSize: '0.85rem' }}>
              Changes here are reflected on the user deposit page immediately.
            </p>
          </div>
          <button onClick={fetchSettings}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1px solid ${border}`, background: 'transparent', color: muted, fontSize: '0.78rem', cursor: 'pointer' }}>
            <RefreshCw style={{ width: 12, height: 12 }} /> Refresh
          </button>
        </div>

        {/* ── Section 1: Crypto Wallet Addresses ── */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>

          {/* Section header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${divLine}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bitcoin style={{ width: 16, height: 16, color: '#f59e0b' }} />
              </div>
              <div>
                <div style={{ color: textClr, fontWeight: 700, fontSize: '0.95rem' }}>Crypto Wallet Addresses</div>
                <div style={{ color: muted, fontSize: '0.72rem' }}>Set the company wallet address for each coin and network</div>
              </div>
            </div>
            <button onClick={saveCoins} disabled={savingCoins}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#d97706,#f59e0b)', color: '#020617', fontWeight: 700, fontSize: '0.82rem', cursor: savingCoins ? 'not-allowed' : 'pointer', opacity: savingCoins ? 0.7 : 1 }}>
              <Save style={{ width: 13, height: 13 }} />
              {savingCoins ? 'Saving…' : 'Save Addresses'}
            </button>
          </div>

          {/* Coins */}
          {coins.map((coin, ci) => {
            const meta   = COIN_META[coin.id] || {}
            const isOpen = expanded[coin.id]
            return (
              <div key={coin.id} style={{ borderBottom: ci < coins.length - 1 ? `1px solid ${divLine}` : 'none' }}>

                {/* Coin header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', cursor: 'pointer' }}
                  onClick={() => setExpanded(e => ({ ...e, [coin.id]: !e[coin.id] }))}>
                  <img src={meta.image} alt={coin.id} width={28} height={28} style={{ borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: textClr, fontWeight: 700, fontSize: '0.875rem' }}>{coin.label}</div>
                    <div style={{ color: muted, fontSize: '0.7rem' }}>
                      {coin.networks?.filter(n => n.address).length || 0}/{coin.networks?.length || 0} addresses set
                    </div>
                  </div>

                  {/* Enable/disable toggle */}
                  <button onClick={e => { e.stopPropagation(); toggleCoin(coin.id) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, border: `1px solid ${coin.enabled ? 'rgba(52,211,153,0.4)' : border}`, background: coin.enabled ? 'rgba(52,211,153,0.08)' : 'transparent', color: coin.enabled ? '#34d399' : muted, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                    {coin.enabled
                      ? <><ToggleRight style={{ width: 13, height: 13 }} /> Enabled</>
                      : <><ToggleLeft  style={{ width: 13, height: 13 }} /> Disabled</>}
                  </button>

                  {isOpen
                    ? <ChevronUp   style={{ width: 14, height: 14, color: muted, flexShrink: 0 }} />
                    : <ChevronDown style={{ width: 14, height: 14, color: muted, flexShrink: 0 }} />}
                </div>

                {/* Networks (expanded) */}
                {isOpen && (
                  <div style={{ padding: '0 22px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {coin.networks?.map(net => (
                      <div key={net.id} style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${divLine}`, borderRadius: 12, padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div>
                            <span style={{ color: textClr, fontWeight: 700, fontSize: '0.82rem' }}>{net.label}</span>
                            {!net.address && (
                              <span style={{ marginLeft: 8, fontSize: '0.68rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 7px', borderRadius: 5 }}>
                                Address not set
                              </span>
                            )}
                          </div>
                          <button onClick={() => toggleNetwork(coin.id, net.id)}
                            style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 9px', borderRadius: 6, border: `1px solid ${net.enabled ? 'rgba(52,211,153,0.3)' : border}`, background: net.enabled ? 'rgba(52,211,153,0.07)' : 'transparent', color: net.enabled ? '#34d399' : muted, cursor: 'pointer' }}>
                            {net.enabled ? 'Active' : 'Disabled'}
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10 }}>
                          <div>
                            <label style={labelStyle}>Wallet Address</label>
                            <input className="settings-input"
                              type="text"
                              placeholder={`Enter ${coin.id} ${net.id} deposit address`}
                              value={net.address || ''}
                              onChange={e => updateNetworkAddr(coin.id, net.id, 'address', e.target.value)}
                              style={{ ...inputStyle, borderColor: net.address ? border : 'rgba(245,158,11,0.3)' }} />
                          </div>
                          <div>
                            <label style={labelStyle}>Network Fee</label>
                            <input className="settings-input"
                              type="text"
                              placeholder="e.g. 1 USDT"
                              value={net.fee || ''}
                              onChange={e => updateNetworkAddr(coin.id, net.id, 'fee', e.target.value)}
                              style={inputStyle} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Section 2: Bank Details ── */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, overflow: 'hidden' }}>

          {/* Section header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `1px solid ${divLine}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(96,165,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 style={{ width: 16, height: 16, color: '#60a5fa' }} />
              </div>
              <div>
                <div style={{ color: textClr, fontWeight: 700, fontSize: '0.95rem' }}>Bank Transfer Details</div>
                <div style={{ color: muted, fontSize: '0.72rem' }}>Company bank account information shown to users</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Enable/disable bank */}
              <button onClick={() => setBank(b => ({ ...b, enabled: !b.enabled }))}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, border: `1px solid ${bank.enabled ? 'rgba(52,211,153,0.4)' : border}`, background: bank.enabled ? 'rgba(52,211,153,0.08)' : 'transparent', color: bank.enabled ? '#34d399' : muted, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                {bank.enabled
                  ? <><ToggleRight style={{ width: 14, height: 14 }} /> Bank Enabled</>
                  : <><ToggleLeft  style={{ width: 14, height: 14 }} /> Bank Disabled</>}
              </button>
              <button onClick={saveBank} disabled={savingBank}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: savingBank ? 'not-allowed' : 'pointer', opacity: savingBank ? 0.7 : 1 }}>
                <Save style={{ width: 13, height: 13 }} />
                {savingBank ? 'Saving…' : 'Save Bank Details'}
              </button>
            </div>
          </div>

          <div style={{ padding: '22px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { key: 'bankName',      label: 'Bank Name',       placeholder: 'e.g. Chase Bank' },
                { key: 'accountName',   label: 'Account Name',    placeholder: 'e.g. AxionTrade Ltd' },
                { key: 'accountNumber', label: 'Account Number',  placeholder: 'e.g. 1234567890' },
                { key: 'routingNumber', label: 'Routing Number',  placeholder: 'e.g. 021000021' },
                { key: 'swiftCode',     label: 'SWIFT / BIC',     placeholder: 'e.g. CHASUS33' },
                { key: 'currency',      label: 'Currency',        placeholder: 'e.g. USD' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={labelStyle}>{label}</label>
                  <input className="settings-input" type="text" placeholder={placeholder}
                    value={bank[key] || ''}
                    onChange={e => setBank(b => ({ ...b, [key]: e.target.value }))}
                    style={inputStyle} />
                </div>
              ))}
            </div>

            {/* Reference — full width */}
            <div>
              <label style={labelStyle}>Payment Reference Instruction</label>
              <input className="settings-input" type="text"
                placeholder="e.g. Your full name + registered email"
                value={bank.reference || ''}
                onChange={e => setBank(b => ({ ...b, reference: e.target.value }))}
                style={inputStyle} />
              <div style={{ color: muted, fontSize: '0.7rem', marginTop: 5 }}>
                This is shown to users as a reminder of what to include in the transfer reference field.
              </div>
            </div>

            {/* Preview */}
            {(bank.bankName || bank.accountNumber) && (
              <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 12, background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${divLine}` }}>
                <div style={{ color: muted, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Preview — what users will see
                </div>
                {[
                  ['Bank Name',      bank.bankName],
                  ['Account Name',   bank.accountName],
                  ['Account Number', bank.accountNumber],
                  ['Routing Number', bank.routingNumber],
                  ['SWIFT / BIC',    bank.swiftCode],
                  ['Currency',       bank.currency],
                ].filter(([,v]) => v).map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${divLine}` }}>
                    <span style={{ color: muted, fontSize: '0.78rem' }}>{label}</span>
                    <span style={{ color: textClr, fontWeight: 600, fontSize: '0.78rem', fontFamily: 'monospace' }}>{value}</span>
                  </div>
                ))}
                {bank.reference && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ color: muted, fontSize: '0.72rem' }}>Reference: </span>
                    <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.78rem' }}>{bank.reference}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}