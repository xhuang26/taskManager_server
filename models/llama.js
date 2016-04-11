// Load required packages
var mongoose = require('mongoose');

// Define our beer schema

var LlamaSchema   = new mongoose.Schema({
  name: {type:String},
  height: {type: Number},
  experience: Array
    
});

LlamaSchema.path('name').required(true, 'Name Is Required!');
LlamaSchema.path('height').required(true, 'Height Is Required!');

/*var Llama = mongoose.model('Llama', LlamaSchema);
var User = mongoose.model('User', UserSchema);
module.exports = {
    Llama: Llama,
    User: User
}*/

// Export the Mongoose model
module.exports = mongoose.model('Llama', LlamaSchema);
//module.exports = mongoose.model('User', UserSchema);

/*var models = {};
module.exports = function(mongoose){
    var LlamaSchema  = new mongoose.Schema({
      name: String,
      height: Number

    });
    var UserSchema = new mongoose.Schema({
        name: String,
        email: String,
        dateCreated: Date,
        pendingTasks:Array   
    });
    models = {
        Llama: mongoose.model('Llama', LlamaSchema),
        User: mongoose.model('User', UserSchema)
    };
    console.log("got here");
    return models;
}*/

