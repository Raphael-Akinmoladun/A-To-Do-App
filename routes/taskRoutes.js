// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authGuard = require('../middleware/authGuard');

// Apply the authGuard to ALL task routes automatically
router.use(authGuard); 

// Get all tasks (Handles the main UI view and filtering)
router.get('/', taskController.getTasks);

// Polling endpoint — returns overdue tasks as JSON for the frontend notification system
// IMPORTANT: must be before /:id routes so 'overdue-check' isn't treated as an ID
router.get('/overdue-check', taskController.getOverdueCheck);

// Create a new task
router.post('/', taskController.createTask);

// Update a task's status (Mark as completed or deleted)
// Note: HTML forms only support GET and POST, so I use POST here for the status update
router.post('/:id/status', taskController.updateTaskStatus);

// Edit task
router.post('/:id/edit', authGuard, taskController.editTask);

module.exports = router;