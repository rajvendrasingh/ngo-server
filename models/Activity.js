import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Education', 'Environment', 'Food Distribution', 'Health Awareness', 'Social Welfare', 'Digital Literacy'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  requiredVolunteers: {
    type: Number,
    required: [true, 'Required volunteers count is required'],
    min: 1,
  },
  maxVolunteers: {
    type: Number,
    required: [true, 'Maximum volunteers count is required'],
    min: 1,
  },
  skillsRequired: [{
    type: String,
    trim: true,
  }],
  coverImage: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  enrolledCount: {
    type: Number,
    default: 0,
  },
  serviceHours: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
