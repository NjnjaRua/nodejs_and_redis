
var connectConfig =
{
    "connectionInfo":
    {
        "user": 
        {
            "http": 
            {
                "ip": "127.0.0.1",
                "port": 8080,
                "paths":
                {
                    "addUser": "/user",
                    "updateUser": "/user/:userId"
                }    
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
            "port": 8000,
            "paths":
            {
                "getUser": "/user/:userId",
                "deleteUser": "/user/:userId",
                "topUser": "/top/:rank"
            }
        },
    },
};
module.exports = {config: connectConfig};