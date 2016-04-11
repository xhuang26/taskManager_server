// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var Llama = require('./models/llama');
var User = require('./models/user');
var Task = require('./models/task');
//var models = require('./models/llama');
//var Llama = new models.Llama
var bodyParser = require('body-parser');
var router = express.Router();
//console.log(router);

//replace this with your Mongolab URL
//mongoose.connect('mongodb://xhuang62:950426@ds017070.mlab.com:17070/mp4_server');
mongoose.connect('mongodb://xhuang62:950426@ds017070.mlab.com:17070/mp4_cs498');
// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT||4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  //res.header("Access-Control-Allow-Origin", "*");
  //res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  
  //next();
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Authorization');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// All our routes will start with /api
app.use('/api', router);

//Default route here
var homeRoute = router.route('/');
//console.log(homeRoute);

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
  //console.log("get here");
});

//routes
var llamaRoute = router.route('/llamas');
var UserRoute = router.route('/users');
var TaskRoute = router.route('/tasks');
var UserRouteId = router.route("/users/:id");
var TaskRouteId = router.route("/tasks/:id");

//functions
var emailExists = function(email, res, gonext){
    User.findOne({email: email}, function(err, data){
        if(err){
            res.json(err.errors);
        }else{
            //console.log(data);
             if(data !== null){
                 //console.log("already exists");
                 gonext(true);
             }else{
                 gonext(false);
             }
        }
    });
}


var idExists = function(model, id, res, gonext){
    model.findOne({"_id": id}, function(err, data){
        if(err){
            res.status(404).json({message: "User Not Found", data:[]});
        }else{
            if(data !== null){
                gonext(true, data);
            }else{
                gonext(false, data);
            }
        }
    });
}


//actions
UserRoute.options(function(req, res){
      res.writeHead(200);
      res.end();
});

UserRoute.post(function(req, res){
    console.log("post on User");
    var user = new User();
    console.log(req.body);
    user.name = req.body.name;
    user.email = req.body.email;
    user.pendingTasks = req.body.pendingTasks;
    if(req.body.pendingTasks === "" || req.body.pendingTasks === undefined)
        user.pendingTasks = [];
    emailExists(user.email, res, function(ifexists){
        console.log("email exists: " + ifexists);
        if(ifexists){
            res.status(500).send({meesage: "This email already exists" , data: []});
        }else{
            console.log("save data will happen");
            console.log(user);
            user.save(function(err){
                if(err){
                    console.log(err.errors);
                    if(err.name === "ValidationError"){
                        console.log("validation error");
                        var requiredname = err.errors.name;
                        var requiredemail = err.errors.email;
                        var temp = err.name + ": ";
                        if(requiredname !== undefined){
                            temp = temp +err.errors.name.message;
                        }
                        if(requiredemail !== undefined){
                            temp = temp+ " " + err.errors.email.message;   
                        } 
                        console.log(temp);
                        res.status(500).json({message: temp, data: [] });
                    }else{
                        res.json(err.errors);
                    }
                }else{
                    res.status(201).json({message: "User Added", data: user});
                }
                        //res.send(req.body);
                        //console.log("finish post");
            });
        }  
    });
    /*.then(function(){
        console.log("save data will happen");
        user.save(function(err){
            if(err){
                if(err.name === "ValidationError"){
                    console.log("validation error");
                    var requiredname = err.errors.name;
                    var requiredemail = err.errors.email;
                    var temp = err.name + ": ";
                    if(requiredname !== undefined){
                        temp = temp +err.errors.name.message;
                    }
                    if(requiredemail !== undefined){
                         temp = temp+ " " + err.errors.email.message;   
                    } 
                    console.log(temp);
                    res.status(500).json({message: temp, data: [] });
                }else{
                    res.json(err.errors);
                }
            }else{
                res.json(req.body);
            }
            //res.send(req.body);
            //console.log("finish post");
        });
        
    });*/
});

UserRoute.get(function(req, res){
    var sort = null;
    var where = null;
    var select = null;
    var limit = null;
    var skip = null;
    if(req.query.sort !== undefined)
        sort = eval("("+ req.query.sort + ")");
    if(req.query.where !== undefined)
        where = eval("("+ req.query.where + ")");
    if(req.query.select !== undefined)
        select = eval("("+ req.query.select + ")");
    if(req.query.limit !== undefined)
        limit = eval("("+ req.query.limit + ")");
    if(req.query.skip !== undefined)
        skip = eval("("+ req.query.skip + ")");
    //.where(where).sort(sort).select(select).limit(limit).skip(skip)
    User.find().where(where).sort(sort).select(select).limit(limit).skip(skip)
    .exec(function(err, users){
        if(err){
            console.log(err.errors);
            res.status(500).json({message:"Internal Error", data: []});
        }else{
            res.json({message: "OK", data: users});
        }
    });  
});





UserRouteId.put(function(req, res){
    var id = req.params.id;
    //var query = {"_id": id};
    //User.updates(query, )
    idExists(User, id, res, function(ifexist, data){
        if(ifexist){
            console.log(data);
            data.name = undefined;
            data.email = undefined;
            var pendingTasks = null;
            if(req.body.name !== undefined)
                data.name = req.body.name;
            if(req.body.email !== undefined)
                data.email = req.body.email;
            if(req.body.pendingTasks !== undefined)
                data.pendingTasks = req.body.pendingTasks;
            data.save(function(err, data){
                if(err){
                    if(err.name === "ValidationError"){
                        console.log("validation error");
                        var requiredname = err.errors.name;
                        var requiredemail = err.errors.email;
                        var temp = err.name + ": ";
                        if(requiredname !== undefined){
                            temp = temp +err.errors.name.message;
                        }
                        if(requiredemail !== undefined){
                            temp = temp+ " " + err.errors.email.message;   
                        } 
                        console.log(temp);
                        res.status(500).json({message: temp, data: [] });
                    }else{
                        res.json(err);
                    }
                }
                else{
                    res.json({message: "User Updated", data: data});
                }
            });   
        }else{
           res.status(404).json({message: "User Not Found", data:[]});
       }
   });
});



UserRouteId.get(function(req, res){
    var id = req.params.id;
    idExists(User, id, res, function(ifexist, data){
        if(ifexist){
            res.json({message: "OK", data: data});
        }else{
            res.status(404).json({message: "User Not Found", data:[]});
        }
    });
});


UserRouteId.delete(function(req, res){
    var id = req.params.id;
    idExists(User, id, res, function(ifexist, data){
        if(ifexist){
            data.remove(function(err){
                if(err)
                    res.json(err);
                else
                    res.json({message:"User deleted", data: []});
            });
        }else{
            res.status(404).json({message: "User Not Found", data:[]});
        }
    });
    /*User.findByIdAndRemove(req.param.llama_id, function(err){
        if(err){
            console.log(err);
            res.status(404).json({message: "User Not Found", data: []});
        }else{
            res.json({message:"User deleted", data: []});
        }
    });*/
});

TaskRoute.options(function(req, res){
      res.writeHead(200);
      res.end();
});

TaskRoute.post(function(req, res){
    var task = new Task();
    task.name = req.body.name;
    task.assignedUser = req.body.assignedUser;
    task.assignedUserName = req.body.assignedUserName;
    task.completed = req.body.completed;
    task.description = req.body.description;
    task.deadline = req.body.deadline;
    task.save(function(err){
        if(err){
            if(err.name === "ValidationError"){
                console.log("validation error");
                var requiredname = err.errors.name;
                var requireddeadline = err.errors.deadline;
                var temp = err.name + ": ";
                if(requiredname !== undefined){
                    temp = temp +err.errors.name.message;
                }
                if(requireddeadline !== undefined){
                    temp = temp+ " " + err.errors.deadline.message;   
                } 
                console.log(temp);
                res.status(500).json({message: temp, data: [] });
            }else{
                res.json(err.errors);
            }
        }else{
            console.log(res);
            console.log(req.body);
            res.status(201).json({message: "User Added", data: task});
        }
                        //res.send(req.body);
                        //console.log("finish post");
    });
});

TaskRoute.get(function(req, res){
    var sort = null;
    var where = null;
    var select = null;
    var limit = null;
    var skip = null;
    if(req.query.sort !== undefined)
        sort = eval("("+ req.query.sort + ")");
    if(req.query.where !== undefined)
        where = eval("("+ req.query.where + ")");
    if(req.query.select !== undefined)
        select = eval("("+ req.query.select + ")");
    if(req.query.limit !== undefined)
        limit = eval("("+ req.query.limit + ")");
    if(req.query.skip !== undefined)
        skip = eval("("+ req.query.skip + ")");
    //.where(where).sort(sort).select(select).limit(limit).skip(skip)
    Task.find().where(where).sort(sort).select(select).limit(limit).skip(skip)
    .exec(function(err, tasks){
        if(err){
            console.log(err.errors);
            res.json(err);
            //res.status(500).json({message:"Internal Error", data: []});
        }else{
            res.json({message: "OK", data: tasks});
        }
    }); 
});

TaskRouteId.put(function(req, res){
    var id = req.params.id;
    
    idExists(Task, id, res, function(ifexist, data){
        console.log(data);
        if(ifexist){
            data.name = undefined;
            data.deadline = undefined;
            if(req.body.name !== undefined)
                data.name = req.body.name;
            if(req.body.deadline !== undefined)
                data.deadline = req.body.deadline;
            if(req.body.completed !== undefined)
                data.completed = req.body.completed;
            if(req.body.assignedUser !== undefined)
                data.assignedUser = req.body.assignedUser;
            if(req.body.assignedUserName !== undefined)
                data.assignedUserName = req.body.assignedUserName;
            data.save(function(err, data){
            
               if(err){
                   if(err.name === "ValidationError"){
                        var requiredname = err.errors.name;
                        var requireddeadline = err.errors.deadline;
                        var temp = err.name + ": ";
                        if(requiredname !== undefined){
                            temp = temp +err.errors.name.message;
                        }
                       if(requireddeadline !== undefined){
                           temp = temp+ " " + err.errors.deadline.message;   
                       } 
                       console.log(temp);
                       res.status(500).json({message: temp, data: [] });
                   }else{
                       res.json(err);
                   }
               }else{
                   res.json({message: "Task Updated", data: data});
               }
            });
        }else{
            res.status(404).json({message: "User Not Found", data:[]});
        }
    });
});
TaskRouteId.get(function(req, res){
    var id = req.params.id;
    idExists(Task, id, res, function(ifexist, data){
        if(ifexist){
            res.json({message: "OK", data: data});
        }else{
            res.status(404).json({message: "Task Not Found", data:[]});
        }
    });
});

TaskRouteId.delete(function(req, res){
    var id = req.params.id;
    idExists(Task, id, res, function(ifexist, data){
        if(ifexist){
            data.remove(function(err){
                if(err)
                    res.json(err);
                else
                    res.json({message:"Task deleted", data: []});
            });
        }else{
            res.status(404).json({message: "Task Not Found", data:[]});
        }
    });
});





/*llamaRoute.post(function(req, res){
    var cat = new Llama({
        name: false,
        email: "a",
        height: 3
    });
    cat.save(function(err){
        if(err){
            console.log(err.errors);
            res.json(err.errors);
           
        }else{
            res.json({message: "finished"});
        }
    })

});*/

//temp
/*llamaRoute.save(function(err){
    if(err)
            res.send(err);
    res.json({message: 'llama added to the database', data: llama});
});*/

//temp
/*llamaRoute.get(function(req, res){
    var sort = eval("("+req.query.sort+")");
    Llama.find()
    .sort(sort)
    .exec(function(err, llamas){
        if(err)
            res.send(err);
        res.json(llamas);
    })
});
//temp, find by id
var llamaRoute = router.route("/llamas/:llama_id");
llamaRoute.get(function(req, res){
    Llama.findById(req.params.llama_id, function(err, llama){
        if(err)
            res.send(err);
        res.json(llamas);
    });
});

//delete by id
var llamaRoute = router.route("/llamas/:llama_id");
llamaRoute.delete(function(req, res){
    Llama.findByIdAndRemove(req.params.llama_id, function(err){
        if(err)
            res.send(err);
        res.json({message: "Llama deleted from the database"});
    });
});

llamaRoute.get(function(req, res) {
  res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
});
*/
//Add more routes here

// Start the server
app.listen(port);
console.log('Server running on port ' + port);
