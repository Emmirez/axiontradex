import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { AlertTriangle, TrendingUp, TrendingDown, Shield, Zap, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { FeaturePage, FeatureHero } from '../features/FeatureLayout'

const RISK_CATEGORIES = [
  {
    title: 'Market Risk',
    icon: TrendingDown,
    description: 'Cryptocurrency markets are highly volatile. Prices can fluctuate dramatically within short periods.',
    risks: [
      'Prices can drop 50% or more in a single day',
      'Market manipulation and "whale" movements',
      'Low liquidity in smaller altcoins',
      'News and social media impact on prices'
    ],
    color: '#f87171'
  },
  {
    title: 'Leverage Risk',
    icon: TrendingUp,
    description: 'Trading with leverage amplifies both gains and losses. You may lose more than your initial investment.',
    risks: [
      'Liquidation risk if margin requirements are not met',
      'Exponential losses in volatile markets',
      'Margin calls require additional funds',
      'Stop-losses may not execute during extreme volatility'
    ],
    color: '#f59e0b'
  },
  {
    title: 'Security Risk',
    icon: Shield,
    description: 'Despite robust security measures, no system is completely immune to threats.',
    risks: [
      'Phishing attacks targeting accounts',
      'API key vulnerabilities',
      'SIM swapping attacks',
      'Smart contract risks in DeFi products'
    ],
    color: '#60a5fa'
  },
  {
    title: 'Regulatory Risk',
    icon: AlertTriangle,
    description: 'Cryptocurrency regulations vary by jurisdiction and may change unexpectedly.',
    risks: [
      'Sudden trading restrictions in your region',
      'Tax implications on trading activities',
      'Compliance requirements may change',
      'Potential exchange closures in certain jurisdictions'
    ],
    color: '#a78bfa'
  },
  {
    title: 'Technical Risk',
    icon: Zap,
    description: 'Platforms and blockchain networks can experience technical issues.',
    risks: [
      'Network congestion causing delays',
      'Smart contract bugs or exploits',
      'Exchange downtime during peak trading',
      'Software bugs affecting order execution'
    ],
    color: '#34d399'
  },
  {
    title: 'Liquidity Risk',
    icon: DollarSign,
    description: 'Some trading pairs may have insufficient liquidity.',
    risks: [
      'Difficulty exiting large positions',
      'Wider spreads in low-liquidity pairs',
      'Slippage on market orders',
      'Delayed order execution'
    ],
    color: '#14b8a6'
  }
]

const RISK_DISCLAIMERS = [
  'Cryptocurrency trading is not suitable for all investors. You should carefully consider your investment experience, financial situation, and risk tolerance.',
  'Past performance does not guarantee future results. The value of your investment can go down as well as up.',
  'AxionTrade does not provide investment advice. All trading decisions are your own responsibility.',
  'You should only trade with funds you can afford to lose completely.',
  'Tax laws regarding cryptocurrency trading vary by jurisdiction. You are responsible for complying with local tax obligations.'
]

export default function RiskDisclosure() {
  const { t } = useTranslation();
  const { darkMode } = useTheme()
  const [expandedRisk, setExpandedRisk] = useState(null)

  const textClr = darkMode ? '#f1f5f9' : '#0f172a'
  const mutedClr = darkMode ? '#64748b' : '#94a3b8'
  const cardBg = darkMode ? 'rgba(15,23,42,0.6)' : 'rgba(248,250,252,0.8)'
  const border = 'rgba(245,158,11,0.18)'

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("legal")}
        title={t("risk")}
        highlight={t("disclosure_dot")}
        subtitle={t("risk_subtitle")}
        icon={AlertTriangle}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* Warning Banner */}
        <div style={{ background: 'rgba(239,68,68,0.1)', borderLeft: `4px solid #f87171`, borderRadius: 12, padding: '20px', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <AlertTriangle style={{ width: 24, height: 24, color: '#f87171' }} />
            <h3 style={{ color: textClr, fontSize: '1rem', fontWeight: 700 }}>{t("important_risk_warning")}</h3>
          </div>
          <p style={{ color: mutedClr, fontSize: '0.9rem', lineHeight: 1.6 }}>
            {t("risk_warning_text")}
          </p>
        </div>

        {/* Risk Categories */}
        <h2 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.5rem', color: textClr, marginBottom: 24 }}>
          {t("key")} <span className="gold-text">{t("risks")}</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 48 }}>
          {RISK_CATEGORIES.map((risk, idx) => (
            <div key={risk.title} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${risk.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <risk.icon style={{ width: 20, height: 20, color: risk.color }} />
                  </div>
                  <h3 style={{ color: textClr, fontSize: '1rem', fontWeight: 600 }}>{risk.title}</h3>
                </div>
                <p style={{ color: mutedClr, fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 12 }}>{risk.description}</p>
                <button
                  onClick={() => setExpandedRisk(expandedRisk === idx ? null : idx)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: risk.color, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                >
                  {expandedRisk === idx ? t("show_less") : t("show_more")} <ChevronDown style={{ width: 12, height: 12, transform: expandedRisk === idx ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>
                {expandedRisk === idx && (
                  <ul style={{ marginTop: 12, paddingLeft: 20, color: mutedClr, fontSize: '0.8rem', lineHeight: 1.6 }}>
                    {risk.risks.map((r, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimers */}
        <h2 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.5rem', color: textClr, marginBottom: 24 }}>
          {t("important")} <span className="gold-text">{t("disclaimers")}</span>
        </h2>
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: '24px', marginBottom: 40 }}>
          <ul style={{ color: mutedClr, fontSize: '0.9rem', lineHeight: 1.8, paddingLeft: 20 }}>
            {RISK_DISCLAIMERS.map((disclaimer, i) => (
              <li key={i} style={{ marginBottom: 12 }}>{disclaimer}</li>
            ))}
          </ul>
        </div>

        {/* Acknowledgment */}
        <div style={{ background: 'rgba(245,158,11,0.05)', border: `1px solid rgba(245,158,11,0.2)`, borderRadius: 20, padding: '24px', textAlign: 'center' }}>
          <h3 style={{ color: textClr, fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>{t("acknowledgment_title")}</h3>
          <p style={{ color: mutedClr, fontSize: '0.85rem', lineHeight: 1.6 }}>
            {t("acknowledgment_line_1")}<br />
            {t("acknowledgment_line_2")}<br />
            {t("acknowledgment_line_3")}<br />
            {t("acknowledgment_line_4")}
          </p>
        </div>
      </div>
    </FeaturePage>
  )
}