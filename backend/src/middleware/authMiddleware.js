import { verifyAccessToken } from '../utils/jwtUtils.js'
import User from '../models/UserModel.js'
import { errorResponse } from '../utils/responseUtils.js'

export const protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) return errorResponse(res, 401, 'Not authorised — no token provided')

    const decoded = verifyAccessToken(token)

    // Exclude base64 KYC image blobs — they're never needed for auth
    const user = await User.findById(decoded.id)
      .select('+refreshTokens -kyc.documentUrl -kyc.selfieUrl -kyc.backUrl')

    if (!user) return errorResponse(res, 401, 'User no longer exists')

    if (user.status === 'suspended') return errorResponse(res, 403, 'Your account has been suspended. Contact support.')
    if (user.status === 'banned')    return errorResponse(res, 403, 'Your account has been permanently banned.')

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') return errorResponse(res, 401, 'Token expired — please refresh')
    return errorResponse(res, 401, 'Invalid token')
  }
}

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, 'You do not have permission to perform this action')
    }
    next()
  }
}

export const adminOnly = restrictTo('admin', 'superadmin')
export const superAdminOnly = restrictTo('superadmin')

export const requireEmailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) return errorResponse(res, 403, 'Please verify your email address first')
  next()
}

export const requireKYC = (req, res, next) => {
  if (req.user.kyc.status !== 'approved') return errorResponse(res, 403, 'KYC verification required to access this feature')
  next()
}