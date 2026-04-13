const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path')
require('dotenv').config(); 

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const appError = require('./utils/appError');


const app = express();

// 1. Template Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(morgan('dev')); // Logs HTTP requests to the console

app.use(express.static(path.join(__dirname, 'public')));

// 3. Session Setup (For Authentication)
app.use(session({
    // In production, this should be securely stored in a .env file
    secret: process.env.SESSION_SECRET || 'super_secret_development_key',
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something is stored
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Cookie expires in 1 day
    }
}));

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Redirect the home page (/) straight to the tasks page
app.get('/', (req, res) => {
    res.redirect('/tasks');
});

app.use((req, res, next) => {
    next(new appError(`The page ${req.originalUrl} cannot be found on this server.`, 404));
});

// Global Error Handler (Must be the last middleware)
app.use(errorHandler);

module.exports = app;