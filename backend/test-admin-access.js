#!/usr/bin/env node

/**
 * Test script to diagnose admin access to assignments
 */

const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Student = require('./models/Student');
const Assignment = require('./models/Assignment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-performance';

async function testAdminAccess() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Get admin user
    console.log('👨‍💼 Checking admin user...');
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ No admin user found');
      process.exit(1);
    }
    console.log('✅ Admin found:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   ID:', admin._id, '\n');

    // Generate JWT token
    console.log('🔑 Generating JWT token...');
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Token generated');
    console.log('   Token preview:', token.substring(0, 20) + '...\n');

    // Check assignments
    console.log('📋 Checking assignments in database...');
    const assignments = await Assignment.find().populate('allocatedTo', 'name studentId');
    console.log(`✅ Found ${assignments.length} assignments`);
    if (assignments.length > 0) {
      console.log('   First assignment:', assignments[0].title);
      console.log('   Status:', assignments[0].status);
      console.log('   Allocated to:', assignments[0].allocatedTo?.name);
    }

    console.log('\n✨ Test complete - Admin can access assignments');
    console.log('\nTo login as admin in the app:');
    console.log('  Email: ' + admin.email);
    console.log('  Password: Admin@123');
    console.log('\nThen navigate to: /admin/tasks/assignments');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAdminAccess();
