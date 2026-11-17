import express from 'express';
import { applyForActivity, getMyApplications, cancelApplication, getAllApplications, updateApplicationStatus, getApplicationStats } from '../controllers/applicationController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', protect, getMyApplications);
router.post('/activity/:activityId', protect, applyForActivity);
router.delete('/:id', protect, cancelApplication);
router.get('/', protect, adminOnly, getAllApplications);
router.put('/:id/status', protect, adminOnly, updateApplicationStatus);
router.get('/stats/overview', protect, adminOnly, getApplicationStats);

export default router;
