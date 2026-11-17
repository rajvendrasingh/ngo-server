import Attendance from '../models/Attendance.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Certificate from '../models/Certificate.js';
import { v4 as uuidv4 } from 'uuid';

export const getActivityAttendance = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const approvedApps = await Application.find({ activity: activityId, status: { $in: ['approved', 'completed'] } })
      .populate('volunteer', 'fullName email phone profileImage');

    const attendanceRecords = await Attendance.find({ activity: activityId });
    const attendanceMap = {};
    attendanceRecords.forEach(a => { attendanceMap[a.volunteer.toString()] = a; });

    const result = approvedApps.map(app => ({
      application: app._id,
      volunteer: app.volunteer,
      attendance: attendanceMap[app.volunteer._id.toString()] || null,
    }));
    res.json({ success: true, volunteers: result });
  } catch (error) {
    next(error);
  }
};

export const markAttendance = async (req, res, next) => {
  try {
    const { volunteerId, activityId, present, serviceHours, notes, applicationId } = req.body;

    let attendance = await Attendance.findOne({ volunteer: volunteerId, activity: activityId });
    const prevHours = attendance ? attendance.serviceHours : 0;
    const prevPresent = attendance ? attendance.present : false;

    if (attendance) {
      attendance.present = present;
      attendance.serviceHours = Number(serviceHours) || 0;
      attendance.notes = notes;
      attendance.markedBy = req.user._id;
      attendance.markedAt = Date.now();
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        volunteer: volunteerId,
        activity: activityId,
        application: applicationId,
        present,
        serviceHours: Number(serviceHours) || 0,
        notes,
        markedBy: req.user._id,
      });
    }

    const hoursDiff = attendance.serviceHours - prevHours;
    if (hoursDiff !== 0) {
      await User.findByIdAndUpdate(volunteerId, { $inc: { totalServiceHours: hoursDiff } });
    }

    if (present && attendance.serviceHours > 0) {
      const application = await Application.findOne({ volunteer: volunteerId, activity: activityId });
      if (application && application.status !== 'completed') {
        application.status = 'completed';
        application.completedAt = Date.now();
        await application.save();
      }
      let cert = await Certificate.findOne({ volunteer: volunteerId, activity: activityId });
      if (!cert) {
        cert = await Certificate.create({
          volunteer: volunteerId,
          activity: activityId,
          attendance: attendance._id,
          certificateId: `CERT-${uuidv4().slice(0, 8).toUpperCase()}`,
          volunteerName: (await User.findById(volunteerId))?.fullName || '',
          activityName: '',
          serviceHours: attendance.serviceHours,
          completionDate: new Date(),
        });
      }
    }

    res.json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ volunteer: req.user._id })
      .populate('activity', 'title category date location status coverImage serviceHours')
      .sort({ markedAt: -1 });
    res.json({ success: true, records });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceStats = async (req, res, next) => {
  try {
    const totalHours = await Attendance.aggregate([
      { $match: { present: true } },
      { $group: { _id: null, total: { $sum: '$serviceHours' } } },
    ]);
    res.json({
      success: true,
      stats: {
        totalVerifiedHours: totalHours[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
