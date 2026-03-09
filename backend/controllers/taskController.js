const Assignment = require('../models/Assignment');
const Presentation = require('../models/Presentation');
const LabTask = require('../models/LabTask');
const Project = require('../models/Project');
const Student = require('../models/Student');
const { allocateProjectBySkills } = require('../utils/randomAllocator');

// ===== ASSIGNMENTS =====
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().populate('allocatedTo', 'name studentId rollNumber').sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createAndAllocateAssignments = async (req, res) => {
  try {
    const { topics, subject, dueDate, batch, semester } = req.body;
    // topics = [{ title, description }, ...]
    
    const students = await Student.find({ batch, semester: Number(semester), isActive: true });
    if (!students.length) return res.status(400).json({ message: 'No students found for this batch/semester' });
    
    // Shuffle students for random allocation
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const assignments = [];
    
    for (let i = 0; i < topics.length; i++) {
      const student = shuffled[i % shuffled.length];
      const assignment = await Assignment.create({
        title: topics[i].title,
        description: topics[i].description || '',
        subject, dueDate, batch, semester: Number(semester),
        allocatedTo: student._id,
        createdBy: req.user._id,
      });
      assignments.push(assignment);
    }
    
    res.status(201).json({ message: `${assignments.length} assignments allocated`, assignments });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const submitAssignment = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    const assignment = await Assignment.findOne({ _id: req.params.id, allocatedTo: student._id });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found or not allocated to you' });
    
    assignment.submittedFile = req.file ? req.file.filename : null;
    assignment.submissionText = req.body.submissionText || '';
    assignment.submittedAt = new Date();
    assignment.status = 'submitted';
    await assignment.save();
    
    res.json({ message: 'Assignment submitted', assignment });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const approveAssignment = async (req, res) => {
  try {
    const { status, adminFeedback, obtainedMarks } = req.body;
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { status, adminFeedback, obtainedMarks },
      { new: true }
    ).populate('allocatedTo', 'name studentId');
    res.json(assignment);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyAssignments = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const assignments = await Assignment.find({ allocatedTo: student._id });
    res.json(assignments);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ===== PRESENTATIONS =====
const getPresentations = async (req, res) => {
  try {
    const presentations = await Presentation.find().populate('allocatedTo', 'name studentId rollNumber').sort({ createdAt: -1 });
    res.json(presentations);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createAndAllocatePresentations = async (req, res) => {
  try {
    const { topics, subject, dueDate, batch, semester } = req.body;
    const students = await Student.find({ batch, semester: Number(semester), isActive: true });
    if (!students.length) return res.status(400).json({ message: 'No students found' });
    
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const presentations = [];
    
    for (let i = 0; i < topics.length; i++) {
      const student = shuffled[i % shuffled.length];
      const pres = await Presentation.create({
        title: topics[i].title,
        description: topics[i].description || '',
        subject, dueDate, batch, semester: Number(semester),
        allocatedTo: student._id,
        createdBy: req.user._id,
      });
      presentations.push(pres);
    }
    res.status(201).json({ message: `${presentations.length} presentations allocated`, presentations });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const submitPresentation = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    const pres = await Presentation.findOne({ _id: req.params.id, allocatedTo: student._id });
    if (!pres) return res.status(404).json({ message: 'Presentation not found' });
    if (!req.file) return res.status(400).json({ message: 'PPT file is required' });
    
    pres.submittedFile = req.file.filename;
    pres.submittedAt = new Date();
    pres.status = 'submitted';
    await pres.save();
    res.json({ message: 'Presentation submitted', pres });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const approvePresentation = async (req, res) => {
  try {
    const { status, adminFeedback, obtainedMarks } = req.body;
    const pres = await Presentation.findByIdAndUpdate(
      req.params.id, { status, adminFeedback, obtainedMarks }, { new: true }
    ).populate('allocatedTo', 'name studentId');
    res.json(pres);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyPresentations = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const presentations = await Presentation.find({ allocatedTo: student._id });
    res.json(presentations);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ===== LAB TASKS =====
const getLabTasks = async (req, res) => {
  try {
    const tasks = await LabTask.find().populate('allocatedTo', 'name studentId rollNumber').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createAndAllocateLabTasks = async (req, res) => {
  try {
    const { tasks: taskList, subject, dueDate, batch, semester } = req.body;
    const students = await Student.find({ batch, semester: Number(semester), isActive: true });
    if (!students.length) return res.status(400).json({ message: 'No students found' });
    
    const allTasks = [];
    for (const taskData of taskList) {
      for (const student of students) {
        const task = await LabTask.create({
          title: taskData.title,
          description: taskData.description || '',
          labNumber: taskData.labNumber,
          subject, dueDate, batch, semester: Number(semester),
          allocatedTo: student._id,
          createdBy: req.user._id,
        });
        allTasks.push(task);
      }
    }
    res.status(201).json({ message: `Lab tasks created for all students`, count: allTasks.length });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const approveLabTask = async (req, res) => {
  try {
    const { status, adminFeedback, obtainedMarks } = req.body;
    const task = await LabTask.findByIdAndUpdate(
      req.params.id,
      { status, adminFeedback, obtainedMarks, approvedAt: status === 'approved' ? new Date() : null },
      { new: true }
    ).populate('allocatedTo', 'name studentId');
    res.json(task);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyLabTasks = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const tasks = await LabTask.find({ allocatedTo: student._id });
    res.json(tasks);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ===== PROJECTS =====
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('allocatedTo', 'name studentId rollNumber').sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createProject = async (req, res) => {
  try {
    const { title, description, requiredSkills, dueDate, batch, semester, maxMarks } = req.body;
    const project = await Project.create({
      title, description, requiredSkills, dueDate, batch,
      semester: Number(semester), maxMarks: maxMarks || 100,
      createdBy: req.user._id, status: 'available'
    });
    res.status(201).json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const chooseProjectBySkills = async (req, res) => {
  try {
    const { chosenSkills } = req.body;
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Check if student already has a project
    const existing = await Project.findOne({ allocatedTo: student._id, status: { $ne: 'available' } });
    if (existing) return res.status(400).json({ message: 'You already have a project allocated', project: existing });

    // Find available project matching skills
    const availableProjects = await Project.find({ status: 'available' });
    const studentWithSkills = { ...student.toObject(), skills: chosenSkills || student.skills };
    const bestMatch = allocateProjectBySkills(availableProjects, studentWithSkills);
    
    if (!bestMatch) return res.status(404).json({ message: 'No matching projects available' });
    
    bestMatch.allocatedTo = student._id;
    bestMatch.studentChosenSkills = chosenSkills || student.skills;
    bestMatch.status = 'allocated';
    await bestMatch.save();
    
    res.json({ message: 'Project allocated based on your skills!', project: bestMatch });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const approveProject = async (req, res) => {
  try {
    const { status, adminFeedback, obtainedMarks } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status, adminFeedback, obtainedMarks, approvedAt: status === 'approved' ? new Date() : null },
      { new: true }
    ).populate('allocatedTo', 'name studentId');
    res.json(project);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyProjects = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const projects = await Project.find({ allocatedTo: student._id });
    res.json(projects);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  getAssignments, createAndAllocateAssignments, submitAssignment, approveAssignment, getMyAssignments,
  getPresentations, createAndAllocatePresentations, submitPresentation, approvePresentation, getMyPresentations,
  getLabTasks, createAndAllocateLabTasks, approveLabTask, getMyLabTasks,
  getProjects, createProject, chooseProjectBySkills, approveProject, getMyProjects,
};
