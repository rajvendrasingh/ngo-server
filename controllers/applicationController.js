import Application from '../models/Application.js';
import Activity from '../models/Activity.js';
import Attendance from '../models/Attendance.js';

export const applyForActivity = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    if (activity.status === 'completed' || activity.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot apply for a completed or cancelled activity' });
    }
    const existing = await Application.findOne({ volunteer: req.user._id, activity: activityId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied for this activity' });
    if (activity.enrolledCount >= activity.maxVolunteers) {
      return res.status(400).json({ success: false, message: 'Activity is full' });
    }
    const application = await Application.create({
      volunteer: req.user._id,
      activity: activityId,
      motivation: req.body.motivation,
    });
    res.status(201).json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ volunteer: req.user._id })
      .populate('activity', 'title category date time location status coverImage')
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

export const cancelApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, volunteer: req.user._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending applications can be cancelled' });
    }
    await application.deleteOne();
    res.json({ success: true, message: 'Application cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllApplications = async (req, res, next) => {
  try {
    const { status, activityId, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (activityId) query.activity = activityId;
    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('volunteer', 'fullName email phone location skills')
      .populate('activity', 'title category date location status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, count: applications.length, total, applications });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const application = await Application.findById(req.params.id).populate('activity');
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    const prevStatus = application.status;
    application.status = status;
    application.adminNote = adminNote;
    application.reviewedAt = Date.now();

    if (status === 'approved' && prevStatus !== 'approved') {
      await Activity.findByIdAndUpdate(application.activity._id, { $inc: { enrolledCount: 1 } });
    }
    if (prevStatus === 'approved' && status !== 'approved') {
      await Activity.findByIdAndUpdate(application.activity._id, { $inc: { enrolledCount: -1 } });
    }
    if (status === 'completed') {
      application.completedAt = Date.now();
    }
    await application.save();
    res.json({ success: true, application });
  } catch (error) {
    next(error);
  }
};

export const getApplicationStats = async (req, res, next) => {
  try {
    const total = await Application.countDocuments();
    const pending = await Application.countDocuments({ status: 'pending' });
    const approved = await Application.countDocuments({ status: 'approved' });
    const rejected = await Application.countDocuments({ status: 'rejected' });
    const completed = await Application.countDocuments({ status: 'completed' });
    res.json({ success: true, stats: { total, pending, approved, rejected, completed } });
  } catch (error) {
    next(error);
  }
};
