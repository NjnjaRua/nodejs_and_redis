var uWSocket;

/* Connect */
var connect = function(host, port)
{
    var conUserWebSocket = require('ws');
    uWSocket = new conUserWebSocket.Server({host: host, port: port});
    uWSocket.on('connection', function connection(ws) {
        console.log("ConUserWebSocket listening port " + port);
    });
};

/* Notify all users */
var sendWsMsg = function (content)
{
    if(uWSocket != null && uWSocket.clients != null)
    {
        for(var client of uWSocket.clients)
        {
            client.send(content);
        }
    }
}
module.exports.connect = connect;
module.exports.sendWsMsg = sendWsMsg;