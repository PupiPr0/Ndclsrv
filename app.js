/**
 * Created by abderrahimelimame on 9/24/16.
 */

var app = require('express')();
var server = require('http').Server(app);
//var server = require('https').Server(app);
var users = require('./users.js')();
var pingInterval = 25000;
var Socket = require('socket.io');
var io = Socket(server, {'pingInterval': pingInterval, 'pingTimeout': 60000});

/**
 * You can control those variables as you want
 */

var serverPort = 44333;
var app_key_secret = "7d3d3b6c2d3683bf25bbb51533ec6dab";
var debugging_mode = true;


/**
 * server listener
 */

var port = process.env.PORT || serverPort;
server.listen(port, function () {
    console.log('Server listening at port %d', port);
    

});


/**
 * this for check if the user connect from the app
 */
io.use(function (socket, next) {
        var token = socket.handshake.query.token;
        if (token === app_key_secret) {
            if (debugging_mode) {
                console.log("token valid  authorized", token);
            }
            next();
        } else {
            if (debugging_mode) {
                console.log("not a valid token Unauthorized to access ");
            }
            next(new Error("not valid token"));
        }
    }
);

/**
 * Socket.io event handling
 */
require('./socketHandler.js')(io, users, debugging_mode, pingInterval);


