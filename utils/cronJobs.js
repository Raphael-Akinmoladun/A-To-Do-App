const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const socket = require('./socket');
const { sendEmail } = require('./emailService');

const initCronJobs = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            
            // Find tasks that are pending and have a due date in the past
            const overdueTasks = await Task.find({
                status: 'pending',
                dueDate: { $lt: now, $ne: null }
            }).populate('user');

            for (const task of overdueTasks) {
                // Update status to overdue
                task.status = 'overdue';
                await task.save();

                const user = task.user;

                // If the user was deleted from the database, skip notifications
                if (!user) {
                    console.log(`Task ${task._id} is overdue but has no valid user attached. Skipping notifications.`);
                    continue;
                }

                // Notify via WebSocket
                socket.notifyUser(user._id, 'task_overdue', {
                    taskId: task._id,
                    title: task.title,
                    message: `Task "${task.title}" is now overdue!`
                });

                // Notify via Email
                if (user.email) {
                    await sendEmail(
                        user.email,
                        'Task Overdue Notice',
                        `Hello ${user.username},\n\nYour task "${task.title}" is now overdue.\n\nPlease log in to complete it.`
                    );
                }
            }
        } catch (error) {
            console.error('Error in cron job for overdue tasks:', error);
        }
    });

    console.log('Cron jobs initialized');
};

module.exports = { initCronJobs };
