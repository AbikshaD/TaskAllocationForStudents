#!/usr/bin/env node

/**
 * Test script to verify student login works correctly
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-performance';

async function testLogin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Get all students
    console.log('📋 Students in database:');
    const students = await Student.find({});
    if (students.length === 0) {
      console.log('⚠️  No students found');
    } else {
      students.forEach((s, i) => {
        console.log(`${i + 1}. ID: ${s.studentId} | Name: ${s.name} | Email: ${s.email}`);
      });
    }

    console.log('\n👥 Student Users in database:');
    const users = await User.find({ role: 'student' });
    if (users.length === 0) {
      console.log('⚠️  No student users found');
    } else {
      users.forEach((u, i) => {
        console.log(`${i + 1}. StudentID: ${u.studentId} | Name: ${u.name} | Email: ${u.email}`);
      });
    }

    // Test login with first student
    if (students.length > 0) {
      console.log('\n🔐 Testing login with first student:');
      const student = students[0];
      const studentId = student.studentId;
      const password = `${studentId}@123`;

      console.log(`   StudentID: ${studentId}`);
      console.log(`   Expected password: ${password}`);

      const user = await User.findOne({ studentId, role: 'student' });
      
      if (!user) {
        console.log('   ❌ ERROR: User not found for this studentId');
      } else {
        console.log(`   ✅ User found: ${user.name}`);
        
        const isMatch = await user.comparePassword(password);
        console.log(`   ${isMatch ? '✅' : '❌'} Password match: ${isMatch}`);
        
        if (!isMatch) {
          console.log('   ⚠️  Password does not match!');
          console.log('   Checking what password was set...');
          // Try to figure out what password might work
          const testPasswords = [
            `${studentId}@123`,
            `${student.name}@123`,
            'password@123',
            student.studentId + '@123'
          ];
          
          for (const testPwd of testPasswords) {
            const match = await user.comparePassword(testPwd);
            if (match) {
              console.log(`   ✅ Found working password: ${testPwd}`);
              break;
            }
          }
        }
      }
    }

    console.log('\n✨ Test complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLogin();
