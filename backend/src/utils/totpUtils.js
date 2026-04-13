import * as OTPAuth from 'otpauth'
import QRCode from 'qrcode'

export const generateTOTPSecret = (user) => {
  const totp = new OTPAuth.TOTP({
    issuer:    process.env.TOTP_ISSUER || 'AxionTrade',
    label:     user.email,
    algorithm: 'SHA1',
    digits:    6,
    period:    30,
    secret:    new OTPAuth.Secret({ size: 20 }), 
  })
  return totp
}

export const verifyTOTPToken = (secret, token) => {
  const totp = new OTPAuth.TOTP({
    issuer:    process.env.TOTP_ISSUER || 'AxionTrade',
    algorithm: 'SHA1',
    digits:    6,
    period:    30,
    secret:    OTPAuth.Secret.fromBase32(secret),
  })
  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}

export const generateQRCode = async (otpAuthUrl) => {
  return QRCode.toDataURL(otpAuthUrl)
}