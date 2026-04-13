import React, { useState, useEffect, useRef, useCallback } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react'
import marketService from '../../services/marketService'
import { useTranslation } from 'react-i18next'

//  Skeleton 
function Skel({ w = '100%', h = 14, r = 6, dark }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r, flexShrink: 0,
      background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
      animation: 'skPulse 1.4s ease-in-out infinite',
    }} />
  )
}

//  Price formatter 
function fmtPrice(p) {
  if (p == null) return '—'
  if (p >= 1000) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (p >= 1)    return `$${p.toFixed(4)}`
  return `$${p.toFixed(6)}`
}

//  Main Component 
export default function TopMovers({ darkMode, onViewAll }) {
  const { t } = useTranslation()
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [lastUpd, setLastUpd] = useState(null)
  const [filter,  setFilter]  = useState('all')
  const timerRef = useRef(null)

  const cardBg  = darkMode ? 'rgba(15,23,42,0.9)'    : 'rgba(255,255,255,0.98)'
  const textClr = darkMode ? '#f1f5f9'                : '#0f172a'
  const muted   = darkMode ? '#64748b'                : '#94a3b8'
  const border  = darkMode ? 'rgba(245,158,11,0.15)' : 'rgba(0,0,0,0.08)'
  const divLine = darkMode ? 'rgba(255,255,255,0.05)': 'rgba(0,0,0,0.06)'
  const hoverBg = darkMode ? 'rgba(255,255,255,0.03)': 'rgba(0,0,0,0.025)'

  const fetchData = useCallback(async () => {
    try {
      const res = await marketService.getMovers()
      setData(res.data || [])
      setLastUpd(new Date())
      setError(null)
    } catch (err) {
      console.error('[TopMovers]', err.message)
      setError(t("live_data_unavailable"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    timerRef.current = setInterval(fetchData, 30_000)
    return () => clearInterval(timerRef.current)
  }, [fetchData])

  const displayed = data
    .filter(c => {
      if (filter === 'gainers') return (c.change24h ?? 0) >= 0
      if (filter === 'losers')  return (c.change24h ?? 0) < 0
      return true
    })
    .slice(0, 7)

  const pillStyle = (active) => ({
    padding: '4px 12px', borderRadius: 20, border: 'none',
    fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
    background: active ? 'linear-gradient(135deg,#d97706,#f59e0b)' : 'transparent',
    color: active ? '#020617' : muted,
    transition: 'all 0.18s',
  })

  return (
    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, overflow: 'hidden' }}>
      <style>{`@keyframes skPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Header */}
      <div style={{ padding: '18px 20px 12px', borderBottom: `1px solid ${divLine}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: textClr, fontWeight: 700, fontSize: '0.95rem' }}>{t("top_movers")}</span>
            <button onClick={fetchData} title={t("refresh")}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: muted, display: 'flex', padding: 2 }}>
              <RefreshCw style={{ width: 12, height: 12 }} />
            </button>
            {lastUpd && (
              <span style={{ color: muted, fontSize: '0.65rem' }}>
                {lastUpd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <button onClick={onViewAll}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            {t("view_all")} <ChevronRight style={{ width: 13, height: 13 }} />
          </button>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'gainers', 'losers'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={pillStyle(filter === f)}>
               {f === 'all' ? t("all") : f === 'gainers' ? t("gainers") : t("losers")}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && !loading && (
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 6, color: '#f87171', fontSize: '0.78rem' }}>
          <AlertCircle style={{ width: 14, height: 14 }} /> {error}
        </div>
      )}

      {/* Rows */}
      {loading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: `1px solid ${divLine}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Skel w={36} h={36} r={18} dark={darkMode} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skel w={100} h={12} r={4} dark={darkMode} />
                <Skel w={60}  h={10} r={4} dark={darkMode} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <Skel w={80} h={14} r={4} dark={darkMode} />
                <Skel w={50} h={11} r={5} dark={darkMode} />
              </div>
            </div>
          ))
        : displayed.map((coin, i) => {
            const up     = (coin.change24h ?? 0) >= 0
            const clr    = coin.change24h == null ? muted : up ? '#34d399' : '#f87171'
            const isLast = i === displayed.length - 1

            return (
              <div key={coin.id}
                style={{ padding: '13px 20px', borderBottom: isLast ? 'none' : `1px solid ${divLine}`, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                {/* Real coin image from backend */}
                <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {coin.image ? (
                    <img src={coin.image} alt={coin.symbol} width={38} height={38}
                      style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                      onError={e => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentNode.innerHTML = `<span style="color:${clr};font-weight:800;font-size:0.65rem;font-family:monospace">${coin.symbol?.slice(0, 2)}</span>`
                      }} />
                  ) : (
                    <span style={{ color: clr, fontWeight: 800, fontSize: '0.65rem', fontFamily: 'monospace' }}>
                      {coin.symbol?.slice(0, 2)}
                    </span>
                  )}
                </div>

                {/* Pair + name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' }}>
                    <span style={{ color: textClr, fontWeight: 700, fontSize: '0.88rem', fontFamily: 'monospace' }}>
                      {coin.symbol}/USDT
                    </span>
                    <span style={{ color: muted, fontSize: '0.68rem' }}>{coin.name}</span>
                  </div>
                  <div style={{ color: muted, fontSize: '0.68rem', marginTop: 2 }}>
                    {t("volume_mover")}: ${((coin.volume || 0) / 1e6).toFixed(1)}M
                  </div>
                </div>

                {/* Price + change */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: textClr, fontWeight: 700, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                    {fmtPrice(coin.price)}
                  </div>
                  <div style={{ marginTop: 3 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 6, background: `${clr}18`, color: clr, fontSize: '0.72rem', fontWeight: 700 }}>
                      {coin.change24h != null
                        ? (up ? <TrendingUp style={{ width: 10, height: 10 }} /> : <TrendingDown style={{ width: 10, height: 10 }} />)
                        : null}
                      {coin.change24h != null ? `${up ? '+' : ''}${coin.change24h.toFixed(2)}%` : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
      }

      {!loading && !error && displayed.length === 0 && (
        <div style={{ padding: '28px 20px', textAlign: 'center', color: muted, fontSize: '0.82rem' }}>
          {t("no_coins_match_filter")}
        </div>
      )}
    </div>
  )
}