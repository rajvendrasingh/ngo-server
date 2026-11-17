import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true,
  },
  attendance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
  },
  certificateId: {
    type: String,
    unique: true,
    required: true,
  },
  volunteerName: String,
  activityName: String,
  serviceHours: Number,
  completionDate: Date,
  issuedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
