const express = require('express');
const router = express.Router();
const { protect, adminOnly, studentOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAssignments, createAndAllocateAssignments, submitAssignment, approveAssignment, getMyAssignments,
  getPresentations, createAndAllocatePresentations, submitPresentation, approvePresentation, getMyPresentations,
  getLabTasks, createAndAllocateLabTasks, approveLabTask, getMyLabTasks,
  getProjects, createProject, chooseProjectBySkills, approveProject, getMyProjects,
} = require('../controllers/taskController');

router.use(protect);

// === ASSIGNMENTS ===
router.get('/assignments', adminOnly, getAssignments);
router.post('/assignments/allocate', adminOnly, createAndAllocateAssignments);
router.put('/assignments/:id/approve', adminOnly, approveAssignment);
router.get('/assignments/my', studentOnly, getMyAssignments);
router.post('/assignments/:id/submit', studentOnly, upload.single('file'), submitAssignment);

// === PRESENTATIONS ===
router.get('/presentations', adminOnly, getPresentations);
router.post('/presentations/allocate', adminOnly, createAndAllocatePresentations);
router.put('/presentations/:id/approve', adminOnly, approvePresentation);
router.get('/presentations/my', studentOnly, getMyPresentations);
router.post('/presentations/:id/submit', studentOnly, upload.single('file'), submitPresentation);

// === LAB TASKS ===
router.get('/lab-tasks', adminOnly, getLabTasks);
router.post('/lab-tasks/allocate', adminOnly, createAndAllocateLabTasks);
router.put('/lab-tasks/:id/approve', adminOnly, approveLabTask);
router.get('/lab-tasks/my', studentOnly, getMyLabTasks);

// === PROJECTS ===
router.get('/projects', adminOnly, getProjects);
router.post('/projects', adminOnly, createProject);
router.put('/projects/:id/approve', adminOnly, approveProject);
router.get('/projects/my', studentOnly, getMyProjects);
router.post('/projects/choose', studentOnly, chooseProjectBySkills);

module.exports = router;
