import User from '../models/User.js';
import Application from '../models/Application.js';
import Attendance from '../models/Attendance.js';

export const getAllVolunteers = async (req, res, next) => {
  try {
    const { search, isActive, page = 1, limit = 20 } = req.query;
    const query = { role: 'volunteer' };
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await User.countDocuments(query);
    const volunteers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, count: volunteers.length, total, volunteers });
  } catch (error) {
    next(error);
  }
};

export const getVolunteerById = async (req, res, next) => {
  try {
    const volunteer = await User.findById(req.params.id).select('-password');
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    const applications = await Application.find({ volunteer: req.params.id })
      .populate('activity', 'title category date status');
    const attendance = await Attendance.find({ volunteer: req.params.id })
      .populate('activity', 'title category date');
    res.json({ success: true, volunteer, applications, attendance });
  } catch (error) {
    next(error);
  }
};

export const toggleVolunteerStatus = async (req, res, next) => {
  try {
    const volunteer = await User.findById(req.params.id);
    if (!volunteer || volunteer.role !== 'volunteer') {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    volunteer.isActive = !volunteer.isActive;
    await volunteer.save();
    res.json({ success: true, volunteer: { ...volunteer.toObject(), password: undefined }, message: `Volunteer ${volunteer.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    next(error);
  }
};

export const getVolunteerStats = async (req, res, next) => {
  try {
    const total = await User.countDocuments({ role: 'volunteer' });
    const active = await User.countDocuments({ role: 'volunteer', isActive: true });
    const topVolunteers = await User.find({ role: 'volunteer' })
      .sort({ totalServiceHours: -1 })
      .limit(5)
      .select('fullName email totalServiceHours profileImage');
    res.json({ success: true, stats: { total, active, topVolunteers } });
  } catch (error) {
    next(error);
  }
};
