const mongoose = require('mongoose');
const { AdminModel } = require('./src/models/admin');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    // Check if both admin users exist
    const admins = [
      { email: 'admin@gmail.com', firstName: 'Admin', lastName: 'User' },
      { email: 'admin@trozzy.com', firstName: 'Admin', lastName: 'Trozzy' }
    ];

    for (const a of admins) {
      const existing = await AdminModel.findOne({ email: a.email });
      if (!existing) {
        const adminUser = new AdminModel({
          firstName: a.firstName,
          lastName: a.lastName,
          email: a.email,
          password: 'admin123',
          phone: '9876543210',
          role: 'admin'
        });
        await adminUser.save();
        console.log(`✅ Admin user ${a.email} created`);
      } else {
        console.log(`✅ Admin user ${a.email} already exists`);
      }
    }

    console.log('✅ Admin creation process completed');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminUser();
