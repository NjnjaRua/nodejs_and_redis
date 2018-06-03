/***** Get Config file and Packages */
    //read config from config.js file
    var {config} = require('./config');
    
    //get express
    var express = require('express');
    
    //get body-parser: JSON format
    var bodyParser = require('body-parser');
    var jsonParser = bodyParser.json();

    //Redis
    var redis = require("redis");

/* Variables and constants */
    var userCount = 0;
    const userHashkey = 'userId:';
    const userCountKey = "userCount";
    const leaderboardKey = "leaderBoard";

/***** Config Port */
    //HTTP
    var conUserHttp = express();
    conUserHttp.listen(config.connectionInfo.user.http.port, config.connectionInfo.user.http.ip, () =>{
        console.log("UsessrHTTP listening port " + config.connectionInfo.user.http.port);
    });

    //Web socket
    var conUserWebSocket = require('ws');
    // var uWSocket = new conUserWebSocket.Server({ port: config.connectionInfo.user.webSocket.port});
    var uWSocket = new conUserWebSocket.Server({host: config.connectionInfo.user.webSocket.ip, port: config.connectionInfo.user.webSocket.port});
    uWSocket.on('connection', function connection(ws) {
        console.log("ConUserWebSocket listening port " + config.connectionInfo.user.webSocket.port);
    });

    //Admin
    var conAdmin = express();
    conAdmin.listen(config.connectionInfo.admin.port, config.connectionInfo.admin.ip, ()=>{
        console.log("ConAdmin listening port " + config.connectionInfo.admin.port);
    });

/* DATABASE */
    var client = redis.createClient(config.connectionInfo.user.database.port, config.connectionInfo.user.database.ip);
    client.on("error", function (err) {
        console.log(err);
    });

    client.get(userCountKey, function(err, obj)
    {
        if(obj != null)
            userCount = parseInt(obj);
    });    

/***** USERS ACTION */
    conUserHttp.use(jsonParser);

    //Add user
    conUserHttp.put(config.paths.addUser, (req, res) =>
    {    
        var userName = req.body.userName;
        var score = req.body.score;
        var numUpdate = req.body.numUpdate;
        client.get(userCountKey, function(userCountError, userCountValue)
        {
            if(userCountError != null)
            {
                res.send("Add user is ERROR - detail: " + userCountError);
            }
            else
            {
                client.hgetall(userHashkey + userCount, function(userHashError, userHashValue)
                {
                    if(userHashError == null && userHashValue == null)
                    {
                        client.hmset(userHashkey + userCount, {"userName" : userName, "score" : score, "numUpdate" : numUpdate});

                        //increase and update userCount key
                        client.incr(userCountKey, function(userCountError, userCountValue)
                        {
                            if(userCountError != null)
                            {
                                res.send("Increase Key " + userCountKey + " is ERROR - detail: " + userCountError);
                            }
                            else if(userCountValue != null)
                            {
                                userCount = parseInt(userCountValue);
                            }
                        });
                        res.send('Add User is SUCCESSFUL');  
                    }
                    else
                    {
                        res.send('User ' + userCountValue + ' have already been exists'); 
                    }
                });
            }
        });
    });

    //Get user info
    conUserHttp.get(config.paths.getUser, (req, res) =>
    {
        var userId = parseInt(req.params.userId);
        if(!Number.isInteger(userId))
        {
            res.send("Get user info is ERROR - Type must be Integer");
        }
        else
        {
            //check user exists
            client.hgetall(userHashkey + userId, function(err, obj)
            {
                if(err != null)
                {
                    res.send("Get user info is ERROR - detail: " + err);
                }
                else
                {
                    if(obj == null)
                    {
                        res.send("There isn't any userId=" + userId);
                    }
                    else
                    {
                        res.send('Get user info is SUCCESSFUL! Info: '  + JSON.stringify(obj));
                    }
                }
            });
        }
    });

    //Update User info
    conUserHttp.post(config.paths.updateUser, (req, res) =>
    {
        var userId = parseInt(req.params.userId);
        if(!Number.isInteger(userId))
        {
            res.send("Update user is ERROR - Type must be Integer");
        }
        else
        {
            var hashKey = userHashkey + userId;
            //check user exists
            client.hgetall(hashKey, function(err, obj)
            {
                if(obj != null && err == null)
                {
                    var userNameNew = req.body.userName;
                    var scoreNew = req.body.score;

                    //update new data
                    var numUpdate = obj.numUpdate;
                    numUpdate++;
                    obj.numUpdate = numUpdate;
                    obj.userName = userNameNew;
                    obj.score = scoreNew;
                    var newObj = JSON.stringify(obj);

                    client.hmset(hashKey, {"userName" : userNameNew, "score" : scoreNew, "numUpdate" : numUpdate});

                    var args = [leaderboardKey, scoreNew, userId];
                    client.zadd(args, function (err, response) 
                    {
                        if(err != null)
                        {
                            res.send("Add " + leaderboardKey + " is ERROR");
                        }
                    });

                    //notify for all users
                    sendWsMsg(newObj);
                    res.send(newObj);        
                }
                else
                {
                    res.send("Update user is ERROR - detail: " + err);
                }
            });
        }
    });

    //Delete Use
    conAdmin.delete(config.paths.deleteUser, (req, res) =>
    {
         var userId = parseInt(req.params.userId);
        if(!Number.isInteger(userId))
        {
            res.send("Delete user is ERROR - Type must be Integer");
        }
        else
        {
            var hashKey = userHashkey + userId;
            client.hgetall(hashKey, function(err, obj)
            {
                if(err != null)
                {
                    res.send("Delete user is ERROR - Detail: " + err);
                }
                else
                {
                    if(obj == null)
                    {
                        res.send("There isn't any userId=" + userId);
                    }
                    else
                    {
                        client.del(hashKey);
                        res.send("Delete userId=" + obj + " is SUCCESSFUL");
                    }
                }
            });
        }
    });

/* Notify User */
    function sendWsMsg(content)
    {
        for(var client of uWSocket.clients)
        {
            client.send(content);
        }
    }

