const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student login using studentId
const studentLogin = async (req, res) => {
  try {
    const { studentId, password } = req.body;
    console.log('🔐 Student login attempt - studentId:', studentId);
    
    const user = await User.findOne({ studentId, role: 'student' });
    console.log('👤 User found:', user ? `${user.name} (${user.email})` : 'NOT FOUND');
    
    if (!user) {
      console.log('❌ No user found with studentId:', studentId);
      return res.status(401).json({ message: 'Invalid student ID or password' });
    }
    
    const passwordMatch = await user.comparePassword(password);
    console.log('🔑 Password match:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('❌ Password mismatch for user:', user.email);
      return res.status(401).json({ message: 'Invalid student ID or password' });
    }
    
    const student = await Student.findOne({ studentId });
    console.log('✅ Student login successful:', studentId);
    res.json({
      _id: user._id,
      name: user.name,
      studentId: user.studentId,
      role: user.role,
      studentData: student,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create initial admin (run once)
const createAdmin = async (req, res) => {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@college.edu',
      password: 'Admin@123',
      role: 'admin',
    });
    res.status(201).json({ message: 'Admin created', email: admin.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let studentData = null;
    if (user.role === 'student') {
      studentData = await Student.findOne({ studentId: user.studentId });
    }
    res.json({ ...user.toObject(), studentData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { adminLogin, studentLogin, createAdmin, getMe };
