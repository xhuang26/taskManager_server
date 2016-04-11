// Load required packages
var mongoose = require('mongoose');

// Define our beer schema

var TaskSchema = new mongoose.Schema({
    name: String,
    assignedUserName: String,
    assignedUser: String,
    dateCreated: {type: Date, default: Date.now},
    completed: Boolean,
    description: String,
    deadline: Date
});
TaskSchema.path('name').required(true, 'Name Is Required!');
TaskSchema.path('deadline').required(true, 'Deadline Is Required!');

module.exports = mongoose.model('Task', TaskSchema);