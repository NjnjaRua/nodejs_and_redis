/***** Get Config file and Packages */
    //read config from other files
    var {config} = require('./scripts/config');
    var constMng = require('./scripts/constantManager');
    var wSocket = require('./scripts/webSocket');
    
/* Variables */
    var userCount = 0;
    
    //get express
    var express = require('express');
    
    //get body-parser: JSON format
    var bodyParser = require('body-parser');
    var urlParser = bodyParser.urlencoded({ extended: false });
    var jsonParser = bodyParser.json();

/***** Config Port */
    //HTTP
    var conUserHttp = express();
    conUserHttp.listen(config.connectionInfo.user.http.port, config.connectionInfo.user.http.ip, () =>{
        console.log("UsessrHTTP listening port " + config.connectionInfo.user.http.port);
    });
    conUserHttp.use(urlParser);
    conUserHttp.use(jsonParser);

    //Web socket
    wSocket.connect(config.connectionInfo.user.webSocket.ip, config.connectionInfo.user.webSocket.port);    

    //Admin
    var conAdmin = express();
    conAdmin.listen(config.connectionInfo.admin.port, config.connectionInfo.admin.ip, ()=>{
        console.log("ConAdmin listening port " + config.connectionInfo.admin.port);
    });
    conAdmin.use(urlParser);
    conAdmin.use(jsonParser);

/* DATABASE */
    //Redis
    var redis = require("redis");

    var client = redis.createClient(config.connectionInfo.user.database.port, config.connectionInfo.user.database.ip);
    client.on("error", function (err) {
        console.log(err);
    });

    client.get(constMng.userCountKey, function(err, obj)
    {
        if(obj != null)constMng.userCountKey
            userCount = parseInt(obj);
    });    

/***** USERS ACTION */
/*
    user: put, post
    admin: get, delete, top
 */
    conUserHttp.put(config.paths.addUser, (req, res) =>
    {    
        var userName = req.body.userName;
        var score = req.body.score;
        client.get(constMng.userCountKey, function(userCountError, userCountValue)
        {
            if(userCountError != null)
            {
                res.send("Add user is ERROR - detail: " + userCountError);
            }
            else
            {
                client.hgetall(constMng.userHashkey + userCount, function(userHashError, userHashValue)
                {
                    if(userHashError == null && userHashValue == null)
                    {
                        client.hmset(constMng.userHashkey + userCount, {"userName" : userName, "score" : score, "numUpdate" : 0});

                        //increase and update userCount key
                        client.incr(constMng.userCountKey, function(userCountError, userCountValue)
                        {
                            if(userCountError != null)
                            {
                                res.send("Increase Key " + constMng.userCountKey + " is ERROR - detail: " + userCountError);
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
            var hashKey = constMng.userHashkey + userId;
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

                    var args = [constMng.leaderboardKey, scoreNew, userId];
                    client.zadd(args, function (err, response) 
                    {
                        if(err != null)
                        {
                            res.send("Add " + constMng.leaderboardKey + " is ERROR");
                        }
                    });

                    //notify for all users
                    wSocket.sendWsMsg(newObj);
                    res.send(newObj);        
                }
                else
                {
                    res.send("Update user is ERROR - detail: " + err);
                }
            });
        }
    });
    
    //Get Top User
    conAdmin.get(config.paths.topUser, (req, res) =>
    {
        var rank = parseInt(req.params.rank);
        if(!Number.isInteger(rank))
        {
            res.send("Get Top user is ERROR - Type must be Integer");
        }
        else
        {
            rank = Math.max(rank - 1,0);
            if(rank == 0)
            {
                res.send("Please, rank must be larger 0");
            }
            else
            {
                client.zrevrange(constMng.leaderboardKey, 0, rank, function(err, obj)
                {
                    if(err != null)
                    {
                        res.send("Get top user is ERROR - detail: " + err);
                    }
                    else if(obj == null)
                    {
                        res.send("Can't get users");
                    }
                    else
                    {
                        res.send("Get Top user is SUCCESS - UserIds: " + JSON.stringify(obj));
                    }
                });
            }
        }
    });

    //Get user info
    conAdmin.get(config.paths.getUser, (req, res) =>
    {
        var userId = parseInt(req.params.userId);
        var top = parseInt(req.params.top);
        if(!Number.isInteger(userId))
        {
            res.send("Get user info is ERROR - Type must be Integer");
        }
        else
        {
            //check user exists
            client.hgetall(constMng.userHashkey + userId, function(err, obj)
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
            var hashKey = constMng.userHashkey + userId;
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

