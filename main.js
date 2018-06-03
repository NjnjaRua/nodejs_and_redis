/***** Get Config file and Packages */
    //read config from config.js file
    var {config} = require('./config');
    
    //get express
    var express = require('express');
    
    //get body-parser: JSON format
    var bodyParser = require('body-parser');
    var jsonParser = bodyParser.json();

/***** Config Port */
    //HTTP
    var conUserHttp = express();
    conUserHttp.listen(config.user.http.port, config.user.http.ip, () =>{
        console.log("UserHTTP listening port " + config.user.http.port);
    });

    //Web socket
    var conUserWebSocket = require('ws');
    var wss = new conUserWebSocket.Server({ port: config.user.webSocket.port});
    wss.on('connection', function connection(ws) {
        console.log("ConUserWebSocket listening port " + config.user.webSocket.port);
    });

    //Admin
    var conAdmin = express();
    conAdmin.listen(config.admin.port, config.admin.ip, ()=>{
        console.log("ConAdmin listening port " + config.admin.port);
    });

/***** USERS ACTION */
    conUserHttp.use(jsonParser);

    //Add user
    conUserHttp.put('/user', (req, res) =>
    {    
        var userName = req.body.userName;
        var score = req.body.score;
        var numUpdate = req.body.numUpdate;    

        res.send("Add User is success " + userName + " ; " + score + " ; " + numUpdate);
    });

    //Get user info
    conUserHttp.get('/user/:userId', (req, res) =>
    {
        var userId = req.params.userId;
        res.send("Get user info is success " + userId);
    });

    //Update User info
    conUserHttp.post('/user/:userId', (req, res) =>
    {
        var userId = req.params.userId;
        var userNameNew = req.body.userName;
        var scoreNew = req.body.score;
        res.send("Update user info is success " + userId + " ; " + userNameNew + " ; " + scoreNew);
    });

    //Delete Use
    conAdmin.delete('/user/:userId', (req, res) =>
    {
        var userId = req.params.userId;
        res.send("Delete user is success " + userId);
    });