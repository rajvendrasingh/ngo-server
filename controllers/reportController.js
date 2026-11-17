import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Application from '../models/Application.js';
import Attendance from '../models/Attendance.js';
import Certificate from '../models/Certificate.js';
import Contact from '../models/Contact.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const activeVolunteers = await User.countDocuments({ role: 'volunteer', isActive: true });
    const totalActivities = await Activity.countDocuments();
    const upcomingActivities = await Activity.countDocuments({ status: 'upcoming' });
    const completedActivities = await Activity.countDocuments({ status: 'completed' });
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const totalApplications = await Application.countDocuments();
    const totalCertificates = await Certificate.countDocuments();
    const unreadMessages = await Contact.countDocuments({ isRead: false });

    const hoursAgg = await Attendance.aggregate([
      { $match: { present: true } },
      { $group: { _id: null, total: { $sum: '$serviceHours' } } },
    ]);
    const totalServiceHours = hoursAgg[0]?.total || 0;

    const monthlyVolunteers = await User.aggregate([
      { $match: { role: 'volunteer' } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const activityByCategory = await Activity.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const applicationTrend = await Application.aggregate([
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      stats: {
        totalVolunteers,
        activeVolunteers,
        totalActivities,
        upcomingActivities,
        completedActivities,
        pendingApplications,
        totalApplications,
        totalCertificates,
        unreadMessages,
        totalServiceHours,
        peopleImpacted: totalVolunteers * 15,
        treesPlanted: completedActivities * 50,
        foodPackets: completedActivities * 200,
        monthlyVolunteers,
        activityByCategory,
        applicationTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getVolunteerDashboard = async (req, res, next) => {
  try {
    const user = req.user;
    const myApplications = await Application.find({ volunteer: user._id })
      .populate('activity', 'title category date time location status coverImage')
      .sort({ createdAt: -1 });

    const totalCompleted = myApplications.filter(a => a.status === 'completed').length;
    const pending = myApplications.filter(a => a.status === 'pending').length;
    const approved = myApplications.filter(a => a.status === 'approved').length;

    const upcoming = myApplications
      .filter(a => a.status === 'approved' && a.activity?.status === 'upcoming')
      .slice(0, 5);

    const attendance = await Attendance.find({ volunteer: user._id, present: true })
      .populate('activity', 'title category date');

    const certificates = await Certificate.countDocuments({ volunteer: user._id });

    res.json({
      success: true,
      dashboard: {
        totalServiceHours: user.totalServiceHours,
        totalCompleted,
        pending,
        approved,
        certificates,
        recentApplications: myApplications.slice(0, 5),
        upcomingActivities: upcoming,
        recentAttendance: attendance.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};
