import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowLeft, Shield, Globe, Lock, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Auth Header — responds to theme 
export function AuthHeader() {
  const navigate = useNavigate()
  const { darkMode, setDarkMode } = useTheme()

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: darkMode ? 'rgba(2,6,23,0.88)' : 'rgba(248,250,252,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${darkMode ? 'rgba(245,158,11,0.12)' : 'rgba(0,0,0,0.08)'}`,
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div className="gold-btn" style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TrendingUp style={{ width: 18, height: 18, color: '#020617' }} />
        </div>
        <span style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.15rem', color: darkMode ? '#f1f5f9' : '#0f172a' }}>
          Axion<span className="gold-text">Trade</span><span style={{ color: darkMode ? "#ffffff" : "#0f172a" }}>X</span>
        </span>
      </Link>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle theme"
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: darkMode ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.8)',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: darkMode ? '#94a3b8' : '#475569', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f59e0b' }}
          onMouseLeave={e => { e.currentTarget.style.color = darkMode ? '#94a3b8' : '#475569' }}
        >
          {darkMode ? <Sun style={{ width: 15, height: 15 }} /> : <Moon style={{ width: 15, height: 15 }} />}
        </button>

        {/* Back to home */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 10, padding: '7px 14px',
            color: '#f59e0b', fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)' }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back to Home
        </button>
      </div>
    </header>
  )
}

//  Auth Footer — ALWAYS DARK (same as landing footer) ─
export function AuthFooter() {
  const year = new Date().getFullYear()

  const regulations = [
    { icon: Shield, text: 'FCA Regulated',    sub: 'UK Financial Conduct Authority'      },
    { icon: Globe,  text: 'SEC Compliant',     sub: 'US Securities & Exchange Commission' },
    { icon: Lock,   text: 'GDPR Compliant',    sub: 'EU Data Protection Regulation'       },
    { icon: Shield, text: 'AML/KYC Certified', sub: 'Anti-Money Laundering Policy'        },
  ]

  return (
    <footer style={{
      background: '#020617',
      borderTop: '1px solid rgba(245,158,11,0.1)',
      padding: '32px 24px 24px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Regulation badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
          {regulations.map(({ icon: Icon, text, sub }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(245,158,11,0.05)',
              border: '1px solid rgba(245,158,11,0.12)',
              borderRadius: 12, padding: '10px 14px',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: 15, height: 15, color: '#f59e0b' }} />
              </div>
              <div>
                <div style={{ color: '#f1f5f9', fontSize: '0.78rem', fontWeight: 600 }}>{text}</div>
                <div style={{ color: '#475569', fontSize: '0.68rem', marginTop: 1 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Legal links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 20px', marginBottom: 16 }}>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'AML Policy', 'Risk Disclosure', 'Regulatory Info'].map(link => (
            <Link
              key={link}
              to={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ color: '#475569', fontSize: '0.75rem', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f59e0b' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#475569' }}
            >
              {link}
            </Link>
          ))}
        </div>

        {/* Risk warning */}
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 16px', marginBottom: 20 }}>
          <p style={{ color: '#94a3b8', fontSize: '0.72rem', lineHeight: 1.7, textAlign: 'center' }}>
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>Risk Warning: </span>
            Trading cryptocurrencies, forex, stocks and other financial instruments involves significant risk of loss
            and is not suitable for all investors. Leverage can work against you. Past performance is not indicative
            of future results. Please ensure you fully understand the risks involved and seek independent financial
            advice if necessary. AxionTrade does not provide investment advice.
          </p>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ color: '#64748b', fontSize: '0.75rem' }}>© {year} AxionTrade Ltd. All rights reserved.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
            {['🇬🇧 FCA No. 123456', '🇺🇸 SEC Registered', '🔒 256-bit SSL', '🛡️ Segregated Funds'].map(badge => (
              <span key={badge} style={{ color: '#64748b', fontSize: '0.72rem' }}>{badge}</span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}