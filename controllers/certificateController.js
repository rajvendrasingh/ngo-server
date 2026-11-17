import Certificate from '../models/Certificate.js';
import Activity from '../models/Activity.js';

export const getMyCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find({ volunteer: req.user._id })
      .populate('activity', 'title category date location')
      .sort({ issuedAt: -1 });

    const enriched = await Promise.all(certs.map(async c => {
      const activity = await Activity.findById(c.activity?._id || c.activity);
      const obj = c.toObject();
      if (activity) obj.activityName = activity.title;
      return obj;
    }));
    res.json({ success: true, certificates: enriched });
  } catch (error) {
    next(error);
  }
};

export const getAllCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find()
      .populate('volunteer', 'fullName email')
      .populate('activity', 'title category date')
      .sort({ issuedAt: -1 });
    res.json({ success: true, certificates: certs });
  } catch (error) {
    next(error);
  }
};

export const getCertificateById = async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certId })
      .populate('volunteer', 'fullName email')
      .populate('activity', 'title category date location');
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, certificate: cert });
  } catch (error) {
    next(error);
  }
};
