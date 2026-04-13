const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Render Signup Page
exports.getSignup = (req, res) => {
    res.render('signup', { error: null });
};

// Handle Signup Logic
exports.postSignup = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('signup', { error: 'Username already taken.' });
        }

        // Hash the password for security
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({
            username,
            password: hashedPassword
        });
        await newUser.save();

        res.redirect('/auth/login');
    } catch (error) {
        next(error); // Pass to global error handler
    }
};

// Render Login Page
exports.getLogin = (req, res) => {
    res.render('login', { error: null });
};

// Handle Login Logic
exports.postLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { error: 'Invalid username or password.' });
        }

        // Compare the provided password with the hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid username or password.' });
        }

        // Save user session
        req.session.userId = user._id;
        req.session.username = user.username;

        res.redirect('/tasks');
    } catch (error) {
        next(error);
    }
};

// Handle Logout
exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.redirect('/auth/login');
    });
};