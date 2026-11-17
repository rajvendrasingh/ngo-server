import express from 'express';
import { getMyCertificates, getAllCertificates, getCertificateById } from '../controllers/certificateController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', protect, getMyCertificates);
router.get('/verify/:certId', getCertificateById);
router.get('/', protect, adminOnly, getAllCertificates);

export default router;
