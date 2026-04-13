class appError extends Error {
    constructor(message, statusCode) {
        super(message); // Call the parent Error class with the message

        this.statusCode = statusCode;
        // If it's a 4xx error, it's a 'fail' (client error). Otherwise, it's an 'error' (server error).
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        // Flag to identify expected errors vs programming bugs
        this.isOperational = true; 

        // Capture the stack trace so you know exactly which file caused the error
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = appError;