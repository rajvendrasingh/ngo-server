import express from 'express';
import { getAllVolunteers, getVolunteerById, toggleVolunteerStatus, getVolunteerStats } from '../controllers/volunteerController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllVolunteers);
router.get('/stats', protect, adminOnly, getVolunteerStats);
router.get('/:id', protect, adminOnly, getVolunteerById);
router.put('/:id/toggle-status', protect, adminOnly, toggleVolunteerStatus);

export default router;
