import sgMail from "@sendgrid/mail";
import logger from "../config/logger.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    await sgMail.send({
      from: {
        email: process.env.EMAIL_FROM,
        name: "AxionTrade",
      },
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}`);
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
    throw err;
  }
};


// Gmail, Outlook, Apple Mail all render Unicode characters reliably.
const LOGO_ROW = `
<table cellpadding="0" cellspacing="0" border="0" role="presentation">
  <tr>
    <td style="vertical-align:middle;padding-right:12px;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation">
        <tr>
          <td style="width:36px;height:36px;background:#f59e0b;border-radius:10px;text-align:center;vertical-align:middle;font-size:18px;font-weight:900;color:#020617;font-family:Arial,sans-serif;line-height:36px;padding:0;">&#x2197;</td>
        </tr>
      </table>
    </td>
    <td style="vertical-align:middle;">
      <span style="font-family:'Segoe UI',Arial,sans-serif;font-size:22px;font-weight:800;color:#f1f5f9;letter-spacing:-0.5px;white-space:nowrap;">Axion<span style="color:#f59e0b;">Trade</span></span>
    </td>
  </tr>
</table>`;

const baseTemplate = (content, footerNote = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #cbd5e1; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #0f172a; border-radius: 20px; overflow: hidden; border: 1px solid rgba(245,158,11,0.15); }
    .header { background: linear-gradient(135deg, #1a0e00 0%, #020617 100%); padding: 32px 40px; border-bottom: 1px solid rgba(245,158,11,0.2); }
    .logo-row { display: flex; align-items: center; gap: 12px; margin-bottom: 0; }
    .logo-text { font-size: 1.4rem; font-weight: 800; color: #f1f5f9; letter-spacing: -0.5px; }
    .logo-text span { color: #f59e0b; }
    .body { padding: 40px; }
    .greeting { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; line-height: 1.3; }
    .subgreeting { font-size: 1rem; color: #f59e0b; font-weight: 600; margin-bottom: 24px; }
    .intro { font-size: 0.9rem; line-height: 1.8; color: #94a3b8; margin-bottom: 28px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 1rem; font-weight: 700; color: #f1f5f9; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
    .feature-grid { display: grid; gap: 10px; }
    .feature-item { background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.12); border-radius: 12px; padding: 12px 16px; display: flex; gap: 12px; align-items: flex-start; }
    .feature-dot { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; margin-top: 7px; flex-shrink: 0; }
    .feature-text strong { color: #f1f5f9; font-size: 0.875rem; display: block; margin-bottom: 2px; }
    .feature-text span { color: #64748b; font-size: 0.8rem; line-height: 1.5; }
    .steps { display: grid; gap: 10px; }
    .step { display: flex; gap: 14px; align-items: flex-start; }
    .step-num { width: 28px; height: 28px; border-radius: 50%; background: rgba(245,158,11,0.15); border: 2px solid #f59e0b; color: #f59e0b; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .step-text strong { color: #f1f5f9; font-size: 0.875rem; }
    .step-text span { color: #64748b; font-size: 0.8rem; display: block; }
    .cta-box { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #d97706, #f59e0b); color: #020617; font-weight: 800; border-radius: 14px; text-decoration: none; font-size: 0.95rem; letter-spacing: 0.3px; }
    .offer-box { background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05)); border: 1px solid rgba(245,158,11,0.25); border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; }
    .offer-box p { color: #94a3b8; font-size: 0.875rem; line-height: 1.7; }
    .offer-box strong { color: #f59e0b; }
    .security-box { background: rgba(52,211,153,0.05); border: 1px solid rgba(52,211,153,0.15); border-radius: 14px; padding: 18px 22px; margin-bottom: 28px; }
    .security-box .sec-title { color: #34d399; font-weight: 700; font-size: 0.9rem; margin-bottom: 10px; }
    .security-item { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 0.82rem; color: #64748b; }
    .security-item::before { content: "✓"; color: #34d399; font-weight: 700; font-size: 0.85rem; }
    .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 24px 0; }
    .footer { padding: 28px 40px; background: #020617; border-top: 1px solid rgba(255,255,255,0.05); }
    .footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .footer-text { font-size: 0.75rem; color: #334155; line-height: 1.7; }
    .footer-text a { color: #f59e0b; text-decoration: none; }
    .disclaimer { font-size: 0.7rem; color: #1e293b; margin-top: 14px; line-height: 1.6; }
    .badge-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
    .badge { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 4px 10px; font-size: 0.68rem; color: #475569; }
    .alert-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 14px; padding: 18px 22px; margin-bottom: 20px; }
    .alert-box .alert-title { color: #f87171; font-weight: 700; font-size: 0.9rem; margin-bottom: 8px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.82rem; }
    .info-row span:first-child { color: #64748b; }
    .info-row span:last-child { color: #f1f5f9; font-weight: 600; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      ${LOGO_ROW}
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:14px;">
        <tr>
          <td style="vertical-align:middle;padding-right:10px;">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation">
              <tr>
                <td style="width:28px;height:28px;background:#f59e0b;border-radius:8px;text-align:center;vertical-align:middle;font-size:14px;font-weight:900;color:#020617;font-family:Arial,sans-serif;line-height:28px;padding:0;">&#x2197;</td>
              </tr>
            </table>
          </td>
          <td style="vertical-align:middle;">
            <span style="font-family:'Segoe UI',Arial,sans-serif;color:#475569;font-size:0.85rem;font-weight:600;">AxionTrade Ltd</span>
          </td>
        </tr>
      </table>
      <p class="footer-text">
        30 St Mary Axe, London EC3A 8BF, United Kingdom<br/>
        <a href="${process.env.CLIENT_URL}">axiontrade.com</a> &nbsp;·&nbsp;
        <a href="${process.env.CLIENT_URL}/contact">Support</a> &nbsp;·&nbsp;
        <a href="${process.env.CLIENT_URL}/privacy-policy">Privacy Policy</a> &nbsp;·&nbsp;
        <a href="${process.env.CLIENT_URL}/terms-of-service">Terms of Service</a>
      </p>
      ${footerNote ? `<p class="disclaimer">${footerNote}</p>` : ""}
      <div class="badge-row">
        <span class="badge">FCA Regulated</span>
        <span class="badge">256-bit SSL</span>
        <span class="badge">GDPR Compliant</span>
        <span class="badge">AML Certified</span>
      </div>
      <p class="disclaimer" style="margin-top:12px;">
        © ${new Date().getFullYear()} AxionTrade Ltd. All rights reserved. This email was sent to you because you have an account with AxionTrade.
        If you did not create this account, please ignore this email or <a href="${process.env.CLIENT_URL}/contact" style="color:#f59e0b;">contact support</a>.
      </p>
    </div>
  </div>
</div>
</body>
</html>
`;

export const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail({
    to: user.email,
    subject: `Verify your AxionTrade email — ${user.firstName}`,
    html: baseTemplate(
      `
      <p class="greeting">One last step, ${user.firstName}!</p>
      <p class="subgreeting">Verify your email to activate your account</p>
      <p class="intro">
        You're almost there. Click the button below to verify your email address and unlock full access to AxionTrade.
        Your account will be activated immediately after verification.
      </p>

      <div class="cta-box">
        <a href="${url}" class="btn">✓ &nbsp; Verify My Email Address</a>
      </div>

      <div class="offer-box">
        <p>This verification link will expire in <strong>24 hours</strong>. If it expires, you can request a new one from the login page.</p>
      </div>

      <div class="security-box">
        <div class="sec-title">Why we verify your email</div>
        <div class="security-item">Protect your account from unauthorised access</div>
        <div class="security-item">Ensure you receive important trade alerts and updates</div>
        <div class="security-item">Enable password recovery if you ever get locked out</div>
      </div>

      <p style="font-size:0.8rem;color:#475569;text-align:center;">
        If the button above does not work, copy and paste this link into your browser:<br/>
        <a href="${url}" style="color:#f59e0b;word-break:break-all;">${url}</a>
      </p>
    `,
      "All investments involve risk. Past performance does not guarantee future results.",
    ),
  });
};

export const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: `Welcome to AxionTrade, ${user.firstName}! Your trading journey starts now`,
    html: baseTemplate(
      `
      <p class="greeting">Welcome to AxionTrade, ${user.firstName} ${user.lastName}!</p>
      <p class="subgreeting">Your Gateway to Professional Trading & Wealth Growth</p>

      <p class="intro">
        We are thrilled to have you join the AxionTrade community — where institutional-grade trading infrastructure
        meets cutting-edge technology, all in one powerful platform. Your journey toward financial growth and
        portfolio diversification begins right now.
      </p>

      <div class="section">
        <div class="section-title">🚀 What Sets AxionTrade Apart</div>
        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-dot"></div>
            <div class="feature-text">
              <strong>AI-Powered Trading Signals</strong>
              <span>Machine learning models that analyse millions of data points per second to surface high-probability trade setups.</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-dot"></div>
            <div class="feature-text">
              <strong>Copy Trading</strong>
              <span>Follow and automatically mirror the positions of our top-performing verified traders. Earn like the best.</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-dot"></div>
            <div class="feature-text">
              <strong>Automated Trading Bots</strong>
              <span>Deploy intelligent bots that trade 24/7 across crypto, gold, and stock markets while you sleep.</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-dot"></div>
            <div class="feature-text">
              <strong>Multi-Asset Markets</strong>
              <span>Trade crypto, gold-backed tokens, global stocks, and earn up to 12% APY on stablecoin holdings.</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-dot"></div>
            <div class="feature-text">
              <strong>Get Funded Programme</strong>
              <span>Prove your skills and trade up to $500,000 of firm capital. Keep up to 90% of all profits you generate.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="section-title">📈 Your First Steps to Success</div>
        <div class="steps">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-text">
              <strong>Complete Your KYC Verification</strong>
              <span>Upload a valid ID to unlock deposits, withdrawals, and full trading access.</span>
            </div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-text">
              <strong>Fund Your Account</strong>
              <span>Deposit via bank transfer, card, or crypto — starting from as little as $10.</span>
            </div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-text">
              <strong>Explore the Markets</strong>
              <span>Browse live crypto, gold, and stock prices with professional charting tools.</span>
            </div>
          </div>
          <div class="step">
            <div class="step-num">4</div>
            <div class="step-text">
              <strong>Choose Your Strategy</strong>
              <span>Manual trading, copy trading, AI signals, or automated bots — your choice.</span>
            </div>
          </div>
          <div class="step">
            <div class="step-num">5</div>
            <div class="step-text">
              <strong>Monitor & Grow</strong>
              <span>Track your portfolio performance, P&amp;L, and earnings in real-time on your dashboard.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="cta-box">
        <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to My Dashboard &rarr;</a>
      </div>

      <div class="divider"></div>

      <div class="offer-box">
        <p>
          <strong>🎁 Welcome Gift:</strong> As a new member, you have complimentary access to our
          <strong>premium AI trading signals</strong> for your first 30 days — absolutely free.
          Start making data-driven investment decisions from day one.
        </p>
      </div>

      <div class="security-box">
        <div class="sec-title">🛡️ Your Security is Our Foundation</div>
        <div class="security-item">Bank-grade 256-bit SSL encryption on all data</div>
        <div class="security-item">98% of crypto assets held in cold storage</div>
        <div class="security-item">$100M security reserve fund</div>
        <div class="security-item">FCA regulated with full AML/KYC compliance</div>
        <div class="security-item">Segregated client funds at all times</div>
      </div>

      <p style="font-size:0.85rem;color:#64748b;text-align:center;line-height:1.7;">
        Questions? Our support team is available 24/7.<br/>
        <a href="${process.env.CLIENT_URL}/contact" style="color:#f59e0b;">Contact Support</a> &nbsp;·&nbsp;
        <a href="${process.env.CLIENT_URL}/blog" style="color:#f59e0b;">Read Our Blog</a> &nbsp;·&nbsp;
        <a href="${process.env.CLIENT_URL}/api-docs" style="color:#f59e0b;">API Documentation</a>
      </p>
    `,
      "All investments carry risk and past performance does not guarantee future results. Please ensure you understand the risks involved and consider seeking independent financial advice. AxionTrade is committed to responsible investing.",
    ),
  });
};

export const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your AxionTrade password",
    html: baseTemplate(`
      <p class="greeting">Password Reset Request</p>
      <p class="subgreeting">Hi ${user.firstName}, we received a request to reset your password</p>

      <p class="intro">
        If you requested a password reset, click the button below. This link is valid for
        <strong style="color:#f59e0b;">1 hour</strong> and can only be used once.
      </p>

      <div class="cta-box">
        <a href="${url}" class="btn">🔐 &nbsp; Reset My Password</a>
      </div>

      <div class="alert-box">
        <div class="alert-title">⚠️ Didn't request this?</div>
        <p style="color:#94a3b8;font-size:0.85rem;line-height:1.7;">
          If you did not request a password reset, your account may be at risk.
          Please <a href="${process.env.CLIENT_URL}/contact" style="color:#f59e0b;">contact our security team</a> immediately
          and consider enabling two-factor authentication (2FA) on your account.
        </p>
      </div>

      <p style="font-size:0.8rem;color:#475569;text-align:center;">
        If the button does not work, copy and paste this link into your browser:<br/>
        <a href="${url}" style="color:#f59e0b;word-break:break-all;">${url}</a>
      </p>
    `),
  });
};

export const sendLoginAlertEmail = async (user, ip) => {
  const time = new Date().toUTCString();
  await sendEmail({
    to: user.email,
    subject: "New login detected on your AxionTrade account",
    html: baseTemplate(`
      <p class="greeting">New Login Detected</p>
      <p class="subgreeting">Hi ${user.firstName}, your account was just accessed</p>

      <p class="intro">
        We detected a new sign-in to your AxionTrade account. If this was you, no action is needed.
        If you don't recognise this login, please secure your account immediately.
      </p>

      <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(245,158,11,0.15);border-radius:14px;padding:20px 24px;margin-bottom:24px;">
        <div class="info-row">
          <span>Time</span>
          <span>${time}</span>
        </div>
        <div class="info-row">
          <span>IP Address</span>
          <span>${ip}</span>
        </div>
        <div class="info-row">
          <span>Account</span>
          <span>${user.email}</span>
        </div>
      </div>

      <div class="alert-box">
        <div class="alert-title">⚠️ Wasn't you?</div>
        <p style="color:#94a3b8;font-size:0.85rem;line-height:1.7;">
          Change your password immediately and enable 2FA. Contact our security team if you need help.
        </p>
      </div>

      <div class="cta-box" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Go to Dashboard</a>
        <a href="${process.env.CLIENT_URL}/contact" style="display:inline-block;padding:14px 28px;border:1px solid rgba(245,158,11,0.3);color:#f59e0b;border-radius:14px;text-decoration:none;font-weight:700;font-size:0.9rem;">Contact Support</a>
      </div>
    `),
  });
};

export const sendWithdrawalOtpEmail = async (user, { amount, currency, code }) => {
  await sendEmail({
    to: user.email,
    subject: "Your AxionTrade Withdrawal Verification Code",
    html: baseTemplate(
      `
      <p class="greeting">Withdrawal Verification</p>
      <p class="subgreeting">Hi ${user.firstName}, confirm your withdrawal request</p>

      <p class="intro">
        You requested a withdrawal of <strong style="color:#f1f5f9;">${amount} ${currency}</strong>.
        Use the code below to authorize this transaction. It expires in <strong style="color:#f59e0b;">10 minutes</strong>.
      </p>

      <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
        <p style="color:#64748b;font-size:0.75rem;text-transform:uppercase;letter-spacing:2px;margin-bottom:14px;">Verification Code</p>
        <div style="font-size:42px;font-weight:900;letter-spacing:14px;color:#f59e0b;font-family:'Courier New',monospace;">${code}</div>
        <p style="color:#475569;font-size:0.75rem;margin-top:14px;">Expires in <strong style="color:#f1f5f9;">10 minutes</strong></p>
      </div>

      <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(245,158,11,0.12);border-radius:14px;padding:20px 24px;margin-bottom:24px;">
        <div class="info-row">
          <span>Amount</span>
          <span>${amount} ${currency}</span>
        </div>
        <div class="info-row">
          <span>Requested at</span>
          <span>${new Date().toUTCString()}</span>
        </div>
        <div class="info-row" style="margin-bottom:0;">
          <span>Account</span>
          <span>${user.email}</span>
        </div>
      </div>

      <div class="alert-box">
        <div class="alert-title">⚠️ Didn't request this withdrawal?</div>
        <p style="color:#94a3b8;font-size:0.85rem;line-height:1.7;">
          If you did not initiate this withdrawal, your account may be compromised.
          <a href="${process.env.CLIENT_URL}/contact" style="color:#f87171;font-weight:700;">Contact our security team immediately</a>
          and change your password.
        </p>
      </div>

      <p style="font-size:0.78rem;color:#334155;text-align:center;line-height:1.7;">
        Never share this code with anyone. AxionTrade staff will never ask for your verification code.
      </p>
    `,
      "Never share this code with anyone. This code is valid for one-time use only.",
    ),
  });
};
