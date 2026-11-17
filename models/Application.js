import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
  },
  motivation: {
    type: String,
    trim: true,
  },
  adminNote: {
    type: String,
    trim: true,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: Date,
  completedAt: Date,
}, { timestamps: true });

applicationSchema.index({ volunteer: 1, activity: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
