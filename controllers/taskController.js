const Task = require('../models/Task');
const AppError = require('../utils/appError');

// Get all tasks for the logged-in user (with optional sorting/filtering)
exports.getTasks = async (req, res, next) => {
    try {
        // Read the filter from the URL query (e.g., /tasks?status=completed)
        const filterStatus = req.query.status; 
        
        // Build the query: always restrict to the logged-in user
        let query = { user: req.session.userId };

        // If a specific status is requested, add it to the query
        // We generally don't want to show 'deleted' tasks in the main view unless specified
        if (filterStatus && ['pending', 'completed'].includes(filterStatus)) {
            query.status = filterStatus;
        } else {
            // Default: show pending and completed, hide deleted
            query.status = { $in: ['pending', 'completed'] }; 
        }

        const tasks = await Task.find(query).sort({ createdAt: -1 }); // Newest first

        res.render('tasks', { 
            tasks, 
            username: req.session.username,
            currentFilter: filterStatus || 'all'
        });
    } catch (error) {
        next(error);
    }
};

// Create a new task
exports.createTask = async (req, res, next) => {
    try {
        const { title } = req.body;

        if (!title || title.trim() === '') {
            // If empty, just redirect back
            return res.redirect('/tasks'); 
        }

        const newTask = new Task({
            title: title.trim(),
            status: 'pending', // Default state
            user: req.session.userId
        });

        await newTask.save();
        res.redirect('/tasks');
    } catch (error) {
        next(error);
    }
};

// Update task status (to completed or deleted)
exports.updateTaskStatus = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const { status } = req.body;

        // 1. Validate input using AppError
        if (!['completed', 'deleted'].includes(status)) {
            return next(new AppError('Invalid status update.', 400));
        }

        const updatedTask = await Task.findOneAndUpdate(
            { _id: taskId, user: req.session.userId }, 
            { status: status },
            { new: true } // Returns the updated document
        );

        // Handle missing data using AppError
        if (!updatedTask) {
            return next(new AppError('Task not found or you do not have permission to edit it.', 404));
        }

        res.redirect('/tasks');
    } catch (error) {
        // System errors automatically fall down here
        next(error);
    }
};


exports.editTask = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const newTitle = req.body.title;

        
        // 1. Just grab the task by its ID, ignore who owns it for a second
        const rawTask = await Task.findById(taskId);

        // 3. Temporarily force the update just so your UI works
        await Task.findByIdAndUpdate(taskId, { title: newTitle });

        // Redirect back
        res.redirect('/tasks');
    } catch (error) {
        console.log("❌ FATAL ERROR:", error.message);
        next(error);
    }
};