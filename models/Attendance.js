import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
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
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
  },
  present: {
    type: Boolean,
    default: false,
  },
  serviceHours: {
    type: Number,
    default: 0,
    min: 0,
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: {
    type: String,
    trim: true,
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

attendanceSchema.index({ volunteer: 1, activity: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
