
var connectConfig =
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
    }
};
module.exports = {config: connectConfig};