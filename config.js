
var connectConfig =
{
    "connectionInfo":
    {
        "user": 
        {
            "http": 
            {
                "ip": "127.0.0.1",
                "port": 8080    
            },
            "webSocket": 
            {
                "ip": "127.0.0.1",
                "port": 8001
            },
            "database": 
            {
                "ip": "127.0.0.1",
                "port": 6379
            }
        },
        "admin":
        {
            "ip": "127.0.0.1",
            "port": 8000
        },
    },    
    "paths":
    {
        "addUser": "/user",
        "getUser": "/user/:userId",
        "updateUser": "/user/:userId",
        "deleteUser": "/user/:userId",
        "topUser": "/top/:rank"
    }
};
module.exports = {config: connectConfig};