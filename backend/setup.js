#!/usr/bin/env node

/**
 * Student Academic Performance Manager - Setup Script
 * Run this to initialize the database and create test data
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-performance';

async function setupDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user
    console.log('\n👨‍💼 Creating admin account...');
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists:', existingAdmin.email);
    } else {
      const admin = await User.create({
        name: 'System Admin',
        email: 'admin@college.edu',
        password: 'Admin@123',
        role: 'admin',
      });
      console.log('✅ Admin created:');
      console.log('   Email:', admin.email);
      console.log('   Password: Admin@123');
    }

    // Create sample students
    console.log('\n🎓 Creating sample students...');
    const sampleStudents = [
      {
        name: 'Priya Sharma',
        email: 'priya@student.com',
        department: 'Computer Science',
        semester: 1,
        batch: '2023-2027',
        rollNumber: 'CS001',
        skills: ['Python', 'Java', 'JavaScript'],
      },
      {
        name: 'Aarav Singh',
        email: 'aarav@student.com',
        department: 'Computer Science',
        semester: 1,
        batch: '2023-2027',
        rollNumber: 'CS002',
        skills: ['React', 'Node.js', 'MongoDB'],
      },
      {
        name: 'Zara Khan',
        email: 'zara@student.com',
        department: 'Information Technology',
        semester: 2,
        batch: '2022-2026',
        rollNumber: 'IT001',
        skills: ['Python', 'Machine Learning', 'Data Science'],
      },
    ];

    for (const studentData of sampleStudents) {
      try {
        const existingStudent = await Student.findOne({ email: studentData.email });
        
        if (existingStudent) {
          console.log(`⚠️  Student already exists: ${existingStudent.name} (ID: ${existingStudent.studentId})`);
          continue;
        }

        // Create student
        const student = await Student.create(studentData);
        console.log(`✅ Student created: ${student.name} (ID: ${student.studentId})`);

        // Create student user account
        const studentUser = await User.create({
          name: student.name,
          email: student.email,
          password: `${student.studentId}@123`,
          role: 'student',
          studentId: student.studentId,
        });

        // Link user to student
        student.userId = studentUser._id;
        await student.save();
        console.log(`   Login Credentials: ${student.studentId} / ${student.studentId}@123`);
      } catch (error) {
        console.error(`❌ Error creating student ${studentData.name}:`, error.message);
      }
    }

    console.log('\n✨ Setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Start backend: npm start');
    console.log('2. Start frontend: npm run dev');
    console.log('3. Login as admin: admin@college.edu / Admin@123');
    console.log('4. Or login as student with any of the credentials shown above');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
