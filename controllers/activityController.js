import Activity from '../models/Activity.js';
import Application from '../models/Application.js';

export const getActivities = async (req, res, next) => {
  try {
    const { category, status, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .populate('createdBy', 'fullName email')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, count: activities.length, total, totalPages: Math.ceil(total / limit), page: Number(page), activities });
  } catch (error) {
    next(error);
  }
};

export const getActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id).populate('createdBy', 'fullName email');
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.json({ success: true, activity });
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req, res, next) => {
  try {
    const { title, description, category, date, time, location, requiredVolunteers, maxVolunteers, skillsRequired, status, serviceHours } = req.body;
    const activityData = {
      title, description, category, date, time, location,
      requiredVolunteers: Number(requiredVolunteers),
      maxVolunteers: Number(maxVolunteers),
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : (skillsRequired ? skillsRequired.split(',').map(s => s.trim()) : []),
      status: status || 'upcoming',
      serviceHours: Number(serviceHours) || 0,
      createdBy: req.user._id,
    };
    if (req.file) activityData.coverImage = `/uploads/${req.file.filename}`;
    const activity = await Activity.create(activityData);
    res.status(201).json({ success: true, activity });
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.coverImage = `/uploads/${req.file.filename}`;
    if (updateData.skillsRequired && !Array.isArray(updateData.skillsRequired)) {
      updateData.skillsRequired = updateData.skillsRequired.split(',').map(s => s.trim());
    }
    if (updateData.requiredVolunteers) updateData.requiredVolunteers = Number(updateData.requiredVolunteers);
    if (updateData.maxVolunteers) updateData.maxVolunteers = Number(updateData.maxVolunteers);
    if (updateData.serviceHours) updateData.serviceHours = Number(updateData.serviceHours);
    const activity = await Activity.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    res.json({ success: true, activity });
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
    await Application.deleteMany({ activity: req.params.id });
    await activity.deleteOne();
    res.json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getActivityStats = async (req, res, next) => {
  try {
    const total = await Activity.countDocuments();
    const upcoming = await Activity.countDocuments({ status: 'upcoming' });
    const ongoing = await Activity.countDocuments({ status: 'ongoing' });
    const completed = await Activity.countDocuments({ status: 'completed' });
    const byCategory = await Activity.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, stats: { total, upcoming, ongoing, completed, byCategory } });
  } catch (error) {
    next(error);
  }
};
