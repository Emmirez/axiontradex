import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Building2, Shield, FileText, Globe, Scale, CheckCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { FeaturePage, FeatureHero } from '../features/FeatureLayout'

const REGULATORY_BODIES = [
  {
    name: 'FinCEN (USA)',
    icon: Building2,
    description: 'Registered as a Money Services Business (MSB) with registration number 31000123456789.',
    status: 'Registered',
    color: '#34d399'
  },
  {
    name: 'FCA (UK)',
    icon: Scale,
    description: 'Authorized and regulated by the Financial Conduct Authority for crypto-asset activities.',
    status: 'Authorized',
    color: '#34d399'
  },
  {
    name: 'CySEC (Cyprus)',
    icon: Shield,
    description: 'Licensed as a Crypto Asset Services Provider (CASP) under registration number 123/22.',
    status: 'Licensed',
    color: '#34d399'
  },
  {
    name: 'AUSTRAC (Australia)',
    icon: Globe,
    description: 'Registered digital currency exchange provider with registration number 100123456.',
    status: 'Registered',
    color: '#34d399'
  }
]

const COMPLIANCE_AREAS = [
  {
    title: 'AML/KYC Compliance',
    description: 'We implement strict Anti-Money Laundering (AML) and Know Your Customer (KYC) procedures to prevent financial crime.',
    requirements: [
      'Identity verification for all users',
      'Source of funds documentation for high-volume traders',
      'Transaction monitoring and reporting',
      'Sanctions screening against global watchlists'
    ]
  },
  {
    title: 'Data Protection',
    description: 'We comply with global data protection regulations including GDPR and CCPA.',
    requirements: [
      'User data collected and processed lawfully',
      'Right to access and delete personal data',
      'Data protection impact assessments',
      'Encrypted storage of sensitive information'
    ]
  },
  {
    title: 'Financial Crime Prevention',
    description: 'We maintain robust systems to detect and prevent financial crime.',
    requirements: [
      'Suspicious activity reporting (SAR)',
      'Enhanced due diligence for high-risk accounts',
      'Transaction monitoring systems',
      'Regular internal audits'
    ]
  },
  {
    title: 'Consumer Protection',
    description: 'We implement measures to protect consumer interests and assets.',
    requirements: [
      'Segregated client funds in cold storage',
      'Clear fee disclosure',
      'Dispute resolution procedures',
      'Regular third-party security audits'
    ]
  }
]

const LICENSES = [
  { name: 'Money Services Business (MSB)', number: '31000123456789', region: 'USA' },
  { name: 'Crypto Asset Services Provider (CASP)', number: '123/22', region: 'Cyprus' },
  { name: 'Digital Currency Exchange (DCE)', number: '100123456', region: 'Australia' },
  { name: 'Virtual Asset Service Provider (VASP)', number: 'VASP-2026-001', region: 'Lithuania' }
]

export default function RegulatoryInfo() {
  const { t } = useTranslation();
  const { darkMode } = useTheme()
  const [expandedCompliance, setExpandedCompliance] = useState(null)

  const textClr = darkMode ? '#f1f5f9' : '#0f172a'
  const mutedClr = darkMode ? '#64748b' : '#94a3b8'
  const cardBg = darkMode ? 'rgba(15,23,42,0.6)' : 'rgba(248,250,252,0.8)'
  const border = 'rgba(245,158,11,0.18)'

  return (
    <FeaturePage>
      <FeatureHero
        badge={t("legal")}
        title={t("regulatory")}
        highlight={t("information_dot")}
        subtitle={t("regulatory_subtitle")}
        icon={FileText}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* Regulatory Bodies */}
        <h2 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.5rem', color: textClr, marginBottom: 24 }}>
          {t("regulatory")} <span className="gold-text">{t("oversight")}</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 48 }}>
          {REGULATORY_BODIES.map(body => (
            <div key={body.name} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${body.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <body.icon style={{ width: 20, height: 20, color: body.color }} />
                </div>
                <div>
                  <h3 style={{ color: textClr, fontSize: '0.95rem', fontWeight: 600 }}>{body.name}</h3>
                  <span style={{ fontSize: '0.7rem', color: body.color }}>{body.status}</span>
                </div>
              </div>
              <p style={{ color: mutedClr, fontSize: '0.8rem', lineHeight: 1.5 }}>{body.description}</p>
            </div>
          ))}
        </div>

        {/* Licenses */}
        <h2 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.5rem', color: textClr, marginBottom: 24 }}>
          {t("active")} <span className="gold-text">{t("licenses")}</span>
        </h2>
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, overflow: 'hidden', marginBottom: 48 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${border}` }}>
                <th style={{ textAlign: 'left', padding: '16px 20px', color: mutedClr, fontSize: '0.75rem', fontWeight: 600 }}>{t("license_name")}</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', color: mutedClr, fontSize: '0.75rem', fontWeight: 600 }}>{t("registration_number")}</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', color: mutedClr, fontSize: '0.75rem', fontWeight: 600 }}>{t("jurisdiction")}</th>
              </tr>
            </thead>
            <tbody>
              {LICENSES.map((license, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${border}` }}>
                  <td style={{ padding: '14px 20px', color: textClr, fontSize: '0.85rem' }}>{license.name}</td>
                  <td style={{ padding: '14px 20px', color: mutedClr, fontSize: '0.85rem', fontFamily: 'monospace' }}>{license.number}</td>
                  <td style={{ padding: '14px 20px', color: mutedClr, fontSize: '0.85rem' }}>{license.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compliance Areas */}
        <h2 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.5rem', color: textClr, marginBottom: 24 }}>
          {t("compliance")} & <span className="gold-text">{t("governance")}</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 48 }}>
          {COMPLIANCE_AREAS.map((area, idx) => (
            <div key={area.title} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: '20px' }}>
                <h3 style={{ color: textClr, fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>{area.title}</h3>
                <p style={{ color: mutedClr, fontSize: '0.8rem', lineHeight: 1.5, marginBottom: 12 }}>{area.description}</p>
                <button
                  onClick={() => setExpandedCompliance(expandedCompliance === idx ? null : idx)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#f59e0b', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                >
                  {expandedCompliance === idx ? t("show_less") : t("show_requirements")} <ChevronDown style={{ width: 12, height: 12, transform: expandedCompliance === idx ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>
                {expandedCompliance === idx && (
                  <ul style={{ marginTop: 12, paddingLeft: 20, color: mutedClr, fontSize: '0.75rem', lineHeight: 1.6 }}>
                    {area.requirements.map((req, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>{req}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Regulatory Reports */}
        <h2 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.5rem', color: textClr, marginBottom: 24 }}>
          {t("regulatory")} <span className="gold-text">{t("reports")}</span>
        </h2>
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: '24px', marginBottom: 48 }}>
          <p style={{ color: mutedClr, fontSize: '0.85rem', marginBottom: 16 }}>{t("regulatory_reports_desc")}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: 12, color: '#f59e0b', fontSize: '0.8rem', textDecoration: 'none' }}>
              <FileText style={{ width: 14, height: 14 }} /> {t("annual_report_2025")}
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: 12, color: '#f59e0b', fontSize: '0.8rem', textDecoration: 'none' }}>
              <Shield style={{ width: 14, height: 14 }} /> {t("security_audit_q1_2026")}
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: 12, color: '#f59e0b', fontSize: '0.8rem', textDecoration: 'none' }}>
              <CheckCircle style={{ width: 14, height: 14 }} /> {t("proof_of_reserves")}
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>
          </div>
        </div>

        {/* Contact */}
        <div style={{ textAlign: 'center', padding: '32px', background: cardBg, border: `1px solid ${border}`, borderRadius: 20 }}>
          <h3 style={{ color: textClr, fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>{t("regulatory_inquiries")}</h3>
          <p style={{ color: mutedClr, fontSize: '0.85rem', marginBottom: 16 }}>
            {t("regulatory_inquiries_desc")} <a href="mailto:legal@axiontrade.com" style={{ color: '#f59e0b', textDecoration: 'none' }}>legal@axiontrade.com</a>
          </p>
        </div>
      </div>
    </FeaturePage>
  )
}