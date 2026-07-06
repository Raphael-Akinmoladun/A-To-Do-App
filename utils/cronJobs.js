const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const socket = require('./socket');
const { sendEmail } = require('./emailService');

const initCronJobs = () => {
    console.log('[CronJob] Registering overdue task checker (runs every minute)...');

    // Run every minute
    cron.schedule('* * * * *', async () => {
        console.log('[CronJob] ⏰ Tick — checking for overdue tasks...');
        try {
            const now = new Date();
            console.log(`[CronJob] Server time (UTC): ${now.toISOString()}`);

            // DEBUG: show ALL pending tasks and their dueDates to spot timezone issues
            const allPending = await Task.find({ status: 'pending', dueDate: { $ne: null } });
            if (allPending.length === 0) {
                console.log('[CronJob] DEBUG: No pending tasks with a dueDate exist in the DB at all.');
            } else {
                console.log(`[CronJob] DEBUG: ${allPending.length} pending task(s) with dueDates found:`);
                allPending.forEach(t => {
                    const due = new Date(t.dueDate);
                    const isOverdue = due < now;
                    console.log(`  → "${t.title}" | dueDate (UTC): ${due.toISOString()} | Overdue? ${isOverdue ? '✅ YES' : '❌ NO (not yet)'}`);
                });
            }

            // Find tasks that are pending and have a due date in the past
            const overdueTasks = await Task.find({
                status: 'pending',
                dueDate: { $lt: now, $ne: null }
            }).populate('user');

            console.log(`[CronJob] Found ${overdueTasks.length} overdue task(s).`);

            for (const task of overdueTasks) {
                console.log(`[CronJob] Processing task: "${task.title}" (ID: ${task._id})`);

                // Update status to overdue
                task.status = 'overdue';
                await task.save();
                console.log(`[CronJob] Task "${task.title}" marked as overdue.`);

                const user = task.user;

                // If the user was deleted from the database, skip notifications
                if (!user) {
                    console.warn(`[CronJob] ⚠️ Task ${task._id} has no valid user. Skipping notifications.`);
                    continue;
                }

                console.log(`[CronJob] User found: ${user.username} | Email: ${user.email || 'NO EMAIL ON RECORD'}`);

                // Notify via WebSocket
                socket.notifyUser(user._id, 'task_overdue', {
                    taskId: task._id,
                    title: task.title,
                    message: `Task "${task.title}" is now overdue!`
                });

                // Notify via Email
                if (user.email) {
                    console.log(`[CronJob] Sending overdue email to ${user.email}...`);
                    const result = await sendEmail(
                        user.email,
                        'Task Overdue Notice',
                        `Hello ${user.username},\n\nYour task "${task.title}" is now overdue.\n\nPlease log in to complete it.`
                    );
                    console.log(`[CronJob] Email result for task "${task.title}":`, JSON.stringify(result));
                } else {
                    console.warn(`[CronJob] ⚠️ User "${user.username}" has no email. Skipping email notification.`);
                }
            }
        } catch (error) {
            console.error('[CronJob] 🚨 Error in overdue task cron job:', error.message);
            console.error(error.stack);
        }
    });

    console.log('[CronJob] ✅ Cron jobs initialized.');
};

module.exports = { initCronJobs };
