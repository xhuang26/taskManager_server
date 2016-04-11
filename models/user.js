// Load required packages
var mongoose = require('mongoose');

// Define our beer schema

var UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    dateCreated: {type: Date, default: Date.now},
    pendingTasks: [],  
});
UserSchema.path('name').required(true, 'Name Is Required!');
UserSchema.path('email').required(true, 'Email Is Required!');

module.exports = mongoose.model('User', UserSchema);