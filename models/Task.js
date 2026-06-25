const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'overdue', 'deleted'], 
        default: 'pending' 
    },
    dueDate: {
        type: Date,
        required: false // Optional, but can be set by the user
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);