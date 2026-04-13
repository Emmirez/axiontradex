import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../sections/Footer'
import { useTheme } from '../../context/ThemeContext'
import { TrendingUp, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function FeatureLayout({ children }) {
  const { darkMode, setDarkMode } = useTheme()
  return (
    <div style={{ minHeight: '100vh', background: darkMode ? '#020617' : '#f1f5f9', display: 'flex', flexDirection: 'column', transition: 'background 0.3s' }}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main style={{ flex: 1, paddingTop: 80 }}>{children}</main>
      <Footer />
    </div>
  )
}

export function FeaturePage({ children }) {
  return <FeatureLayout>{children}</FeatureLayout>
}

export function FeatureHero({ badge, title, highlight, subtitle, icon: Icon }) {
  const { darkMode } = useTheme()
  return (
    <div style={{ position: 'relative', overflow: 'hidden', padding: '60px 24px 48px', background: darkMode ? 'radial-gradient(ellipse at 50% 0%, #1a0e00 0%, #020617 60%)' : 'radial-gradient(ellipse at 50% 0%, #fef3c7 0%, #f1f5f9 60%)' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 300, background: 'rgba(245,158,11,0.06)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 999, padding: '6px 16px', marginBottom: 20 }}>
          {Icon && <Icon style={{ width: 14, height: 14, color: '#f59e0b' }} />}
          <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600 }}>{badge}</span>
        </div>
        <h1 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 900, fontSize: 'clamp(2rem,5vw,3.5rem)', color: darkMode ? '#f1f5f9' : '#0f172a', lineHeight: 1.1, marginBottom: 16 }}>
          {title} <span className="gold-text">{highlight}</span>
        </h1>
        <p style={{ color: darkMode ? '#64748b' : '#64748b', fontSize: '1rem', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>{subtitle}</p>
      </div>
    </div>
  )
}

export function StatCard({ value, label, icon: Icon, color = '#f59e0b' }) {
  const { darkMode } = useTheme()
  return (
    <div style={{ background: darkMode ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.95)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 20, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: 22, height: 22, color }} />
      </div>
      <div>
        <div style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.5rem', color }}>{value}</div>
        <div style={{ color: darkMode ? '#64748b' : '#94a3b8', fontSize: '0.8rem', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}

export function FeatureCard({ icon: Icon, title, desc, color = '#f59e0b' }) {
  const { darkMode } = useTheme()
  return (
    <div
      style={{ background: darkMode ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.95)', border: '1px solid rgba(245,158,11,0.14)', borderRadius: 20, padding: '24px', transition: 'all 0.3s', cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.14)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Icon style={{ width: 20, height: 20, color }} />
      </div>
      <h4 style={{ color: darkMode ? '#f1f5f9' : '#0f172a', fontWeight: 600, fontSize: '0.95rem', marginBottom: 8 }}>{title}</h4>
      <p style={{ color: darkMode ? '#64748b' : '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}

export function CTABanner({ title, subtitle }) {
  const { t } = useTranslation()
  const { darkMode } = useTheme()
  return (
    <div style={{ maxWidth: 900, margin: '0 auto 60px', padding: '0 16px' }}>
      <div style={{ background: darkMode ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.95)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 24, padding: '48px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, background: 'rgba(245,158,11,0.06)', filter: 'blur(60px)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 800, fontSize: 'clamp(1.6rem,4vw,2.4rem)', color: darkMode ? '#f1f5f9' : '#0f172a', marginBottom: 12 }}>{title}</h2>
          <p style={{ color: darkMode ? '#64748b' : '#94a3b8', fontSize: '0.95rem', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>{subtitle}</p>
          <Link to="/register" className="gold-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 14, textDecoration: 'none', fontSize: '0.95rem', fontWeight: 700 }}>
            {t("get_started_free")} →
          </Link>
        </div>
      </div>
    </div>
  )
}