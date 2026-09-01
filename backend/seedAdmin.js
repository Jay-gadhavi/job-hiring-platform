require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillhire';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for Admin Seeding...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@skillhire.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log(`[OK] Existing account (${adminEmail}) role confirmed as 'admin'.`);
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`[OK] Super Admin account created successfully!`);
      console.log(`     Email: ${adminEmail}`);
      console.log(`     Password: ${adminPassword}`);
    }

    await mongoose.disconnect();
    console.log('Database disconnected. Admin seed complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
