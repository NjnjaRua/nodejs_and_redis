/***** Get Config file and Packages */
    var {config} = require('./config');
    var express = require('express');

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
    //Add user
    conUserHttp.put('/user', (req, res) =>
    {    
        res.send("Add User is success");
    });

    //Get user info
    conUserHttp.get('/user/:userId', (req, res) =>
    {
        res.send("Get user info is success");
    });

    //Update User info
    conUserHttp.post('/user/:userId', (req, res) =>
    {
        res.send("Update user info is success");
    });

    //Delete Use
    conAdmin.delete('/user/:userId', (req, res) =>
    {
        res.send("Delete user is success");
    });