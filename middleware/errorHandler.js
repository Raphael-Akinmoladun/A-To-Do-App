const errorHandler = (err, req, res, next) => {
    // Log the error locally
    console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    //Check if the requester wants HTML FIRST (Browsers)
    if (req.accepts('html')) {
        return res.status(statusCode).render('error', { message });
    }

    //Fallback to JSON (For API requests / Fetch calls)
    if (req.accepts('json')) {
        return res.status(statusCode).json({ success: false, message });
    }

    // 3. Ultimate fallback (Plain text)
    res.status(statusCode).type('txt').send(message);
};

module.exports = errorHandler;