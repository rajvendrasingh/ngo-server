import express from 'express';
import { getActivities, getActivity, createActivity, updateActivity, deleteActivity, getActivityStats } from '../controllers/activityController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getActivities);
router.get('/stats', protect, adminOnly, getActivityStats);
router.get('/:id', getActivity);
router.post('/', protect, adminOnly, upload.single('coverImage'), createActivity);
router.put('/:id', protect, adminOnly, upload.single('coverImage'), updateActivity);
router.delete('/:id', protect, adminOnly, deleteActivity);

export default router;
