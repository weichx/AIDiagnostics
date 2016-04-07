var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(1234, function() {
    console.log('listening on ', 1234);
});

io.on('connection', function (socket) {

    console.log('got one!');

    socket.emit('AIConsiderationTypes_Request', 'datas');

    socket.on('AIConsiderationTypes_Response', function (data) {
        console.log(data);
    });

    socket.on('test_message', function (data) {
        console.log('got message:', data);
    });

    socket.on('disconnect', function () {
        console.log('disconnected');
    });
});