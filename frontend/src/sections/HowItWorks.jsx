import React, { useState } from 'react'
import { UserPlus, CreditCard, BarChart3, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'



export default function HowItWorks() {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)

    const STEPS = [
    {
      num: '01',
      icon: UserPlus,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.12)',
      title: t('create_account'),
      desc: t('create_account_desc'),
      detail: [
        t('create_account_step1'),
        t('create_account_step2'),
        t('create_account_step3'),
        t('create_account_step4'),
      ],
    },
    {
      num: '02',
      icon: CreditCard,
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.12)',
      title: t('fund_account'),
      desc: t('fund_account_desc'),
      detail: [
        t('fund_account_step1'),
        t('fund_account_step2'),
        t('fund_account_step3'),
        t('fund_account_step4'),
      ],
    },
    {
      num: '03',
      icon: BarChart3,
      color: '#34d399',
      bg: 'rgba(52,211,153,0.12)',
      title: t('explore_platform'),
      desc: t('explore_platform_desc'),
      detail: [
        t('explore_step1'),
        t('explore_step2'),
        t('explore_step3'),
        t('explore_step4'),
      ],
    },
    {
      num: '04',
      icon: TrendingUp,
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.12)',
      title: t('start_earning'),
      desc: t('start_earning_desc'),
      detail: [
        t('start_earning_step1'),
        t('start_earning_step2'),
        t('start_earning_step3'),
        t('start_earning_step4'),
      ],
    },
  ]

  return (
    <section id="how-it-works" className="section-base py-20 lg:py-28 fade-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-yellow-500 text-xs font-semibold mb-3 uppercase tracking-widest">{t('how_it_works')}</p>
          <h2 className="font-display font-extrabold text-white mb-4" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)' }}>
            {t('four_simple_steps')} <span className="gold-text">{t("steps")}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t('how_it_works_subtitle')}
          </p>
        </div>

        {/* Steps layout */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* Left — step list */}
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                onClick={() => setActiveStep(i)}
                className="card rounded-2xl p-5 cursor-pointer transition-all duration-300"
                style={{
                  borderColor: activeStep === i ? step.color + '66' : 'rgba(245,158,11,0.14)',
                  background: activeStep === i
                    ? (document.documentElement.classList.contains('dark') ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.98)')
                    : undefined,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: activeStep === i ? step.bg : 'rgba(255,255,255,0.04)' }}
                  >
                    <step.icon className="w-5 h-5" style={{ color: activeStep === i ? step.color : '#475569' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-xs font-bold font-mono"
                        style={{ color: activeStep === i ? step.color : '#475569' }}
                      >
                        {step.num}
                      </span>
                      <h4
                        className="font-semibold text-sm"
                        style={{ color: activeStep === i ? '#f1f5f9' : '#94a3b8' }}
                      >
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{step.desc}</p>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 flex-shrink-0 transition-all"
                    style={{ color: activeStep === i ? step.color : '#334155', transform: activeStep === i ? 'translateX(2px)' : 'none' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Right — detail panel */}
          <div
            className="card rounded-3xl p-8 sticky top-24"
            style={{ borderColor: STEPS[activeStep].color + '44' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: STEPS[activeStep].bg }}
            >
              {React.createElement(STEPS[activeStep].icon, {
                className: 'w-8 h-8',
                style: { color: STEPS[activeStep].color },
              })}
            </div>

            <div
              className="text-xs font-bold font-mono mb-2"
              style={{ color: STEPS[activeStep].color }}
            >
              {t('step')} {STEPS[activeStep].num}
            </div>

            <h3
              className="font-display font-bold text-white mb-4"
              style={{ fontSize: 'clamp(1.3rem,3vw,1.8rem)' }}
            >
              {STEPS[activeStep].title}
            </h3>

            <p className="text-slate-400 leading-relaxed mb-6">
              {STEPS[activeStep].desc}
            </p>

            <ul className="space-y-3 mb-8">
              {STEPS[activeStep].detail.map(d => (
                <li key={d} className="flex items-center gap-3 text-sm text-slate-300">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: STEPS[activeStep].bg, color: STEPS[activeStep].color }}
                  >
                    ✓
                  </span>
                  {d}
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="gold-btn flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold"
              style={{ textDecoration: 'none' }}
            >
               {t('get_started_free')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}