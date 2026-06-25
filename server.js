require('dotenv').config() // Load environment variables from .env file

const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger'); // Using the custom logger we built


// 1. Environment Variables Setup
// When hosting on Render, process.env.PORT and process.env.MONGO_URI will be provided automatically.
// For local development, we provide fallback values.
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo-app';

// Catch synchronous errors (bugs in the code) that happen outside of Express
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down server...', err);
    process.exit(1); 
});

// 2. Database Connection
    mongoose.connect(MONGO_URI)
    .then(() => {
        logger.success('Successfully connected to MongoDB.');
        
        // 3. Start the Server ONLY after the database is connected
        const server = app.listen(PORT, () => {
            logger.info(`Server is actively running on http://localhost:${PORT}`);
        });

        // Initialize Socket.io
        const socket = require('./utils/socket');
        socket.init(server);

        // Initialize Cron Jobs
        const cronJobs = require('./utils/cronJobs');
        cronJobs.initCronJobs();

        // Catch asynchronous promise rejections (like the database dropping connection later)
        process.on('unhandledRejection', (err) => {
            logger.error('UNHANDLED PROMISE REJECTION! Shutting down server...', err);
            server.close(() => {
                process.exit(1);
            });
        });
    })
    .catch((err) => {
        logger.error('Failed to connect to MongoDB. Is your database running?', err);
        process.exit(1); 
    });
