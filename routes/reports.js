import express from 'express';
import { getDashboardStats, getVolunteerDashboard } from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin-dashboard', protect, adminOnly, getDashboardStats);
router.get('/volunteer-dashboard', protect, getVolunteerDashboard);

export default router;
