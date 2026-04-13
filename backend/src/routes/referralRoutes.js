// routes/referralRoutes.js
import express from 'express';
import { 
  getReferralData,
  getReferralStats
} from '../controllers/referralController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes 
router.use(protect);

// GET /api/referral 
router.get('/', getReferralData);

// GET /api/referral/stats 
router.get('/stats', getReferralStats);

export default router;