import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Activity from '../models/Activity.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      const admin = await User.create({
        fullName: 'NGO Admin',
        email: process.env.ADMIN_EMAIL,
        phone: '+1234567890',
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
        age: 35,
        location: 'New York, USA',
        skills: ['Management', 'Leadership', 'Communication'],
        availability: 'flexible',
        areasOfInterest: ['Education', 'Environment'],
        isActive: true,
      });
      console.log(`Admin created: ${admin.email}`);
    } else {
      console.log('Admin already exists');
    }

    const activityCount = await Activity.countDocuments();
    if (activityCount === 0) {
      const admin = await User.findOne({ role: 'admin' });
      const activities = [
        {
          title: 'Community Tree Planting Drive',
          description: 'Join us in planting 500 trees in the local park to combat climate change and restore our ecosystem.',
          category: 'Environment',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          time: '09:00 AM',
          location: 'Central Park, New York',
          requiredVolunteers: 20,
          maxVolunteers: 30,
          skillsRequired: ['Physical fitness', 'Teamwork'],
          status: 'upcoming',
          serviceHours: 4,
          createdBy: admin._id,
        },
        {
          title: 'Free Health Checkup Camp',
          description: 'Providing free health checkups including blood pressure, sugar levels, and general consultation.',
          category: 'Health Awareness',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          time: '10:00 AM',
          location: 'Community Hall, Brooklyn',
          requiredVolunteers: 15,
          maxVolunteers: 20,
          skillsRequired: ['Medical knowledge', 'Communication'],
          status: 'upcoming',
          serviceHours: 6,
          createdBy: admin._id,
        },
        {
          title: 'Digital Literacy Workshop',
          description: 'Teaching basic computer skills and internet safety to senior citizens and underprivileged youth.',
          category: 'Digital Literacy',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          time: '02:00 PM',
          location: 'Public Library, Manhattan',
          requiredVolunteers: 10,
          maxVolunteers: 15,
          skillsRequired: ['Computer skills', 'Teaching', 'Patience'],
          status: 'upcoming',
          serviceHours: 3,
          createdBy: admin._id,
        },
        {
          title: 'Food Distribution Drive',
          description: 'Distributing food packets to homeless shelters and underprivileged families in the downtown area.',
          category: 'Food Distribution',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          time: '08:00 AM',
          location: 'Downtown Shelter, NYC',
          requiredVolunteers: 25,
          maxVolunteers: 35,
          skillsRequired: ['Physical fitness', 'Organization'],
          status: 'completed',
          serviceHours: 5,
          createdBy: admin._id,
        },
        {
          title: 'Education Support Program',
          description: 'Tutoring underprivileged children in mathematics, science, and English.',
          category: 'Education',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          time: '03:00 PM',
          location: 'Community School, Queens',
          requiredVolunteers: 12,
          maxVolunteers: 20,
          skillsRequired: ['Teaching', 'Patience', 'Subject knowledge'],
          status: 'upcoming',
          serviceHours: 4,
          createdBy: admin._id,
        },
        {
          title: 'Social Welfare Awareness Campaign',
          description: 'Raising awareness about social welfare schemes available for low-income families.',
          category: 'Social Welfare',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          time: '11:00 AM',
          location: 'Town Square, Bronx',
          requiredVolunteers: 8,
          maxVolunteers: 15,
          skillsRequired: ['Communication', 'Awareness', 'Networking'],
          status: 'upcoming',
          serviceHours: 3,
          createdBy: admin._id,
        },
      ];
      await Activity.insertMany(activities);
      console.log(`${activities.length} activities created`);
    } else {
      console.log('Activities already exist');
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();
