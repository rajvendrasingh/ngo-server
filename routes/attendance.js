import express from 'express';
import { getActivityAttendance, markAttendance, getMyAttendance, getAttendanceStats } from '../controllers/attendanceController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', protect, getMyAttendance);
router.get('/stats', protect, adminOnly, getAttendanceStats);
router.get('/activity/:activityId', protect, adminOnly, getActivityAttendance);
router.post('/mark', protect, adminOnly, markAttendance);

export default router;
