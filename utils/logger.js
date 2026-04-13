const logger = {
    info: (message) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    },
    
    warn: (message) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
    },
    
    error: (message, err = null) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
        if (err && err.stack) {
            console.error(err.stack); // Print the stack trace if provided
        }
    },
    
    success: (message) => {
        // Optional: You could add colors using a library like 'chalk', 
        // but keeping it simple with standard console methods is fine.
        console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`);
    }
};

module.exports = logger;