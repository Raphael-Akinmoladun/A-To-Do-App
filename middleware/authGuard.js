const authGuard = (req, res, next) => {
    // Check if the user's ID is stored in the session
    if (req.session && req.session.userId) {
        return next(); // User is authenticated, proceed to the next function/route
    }
    
    // If no session exists, redirect them to the login page
    res.redirect('/auth/login');
};

module.exports = authGuard;