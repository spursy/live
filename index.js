var http = require('http');
var express = require('express');
var port = 9000;
var app = express();
process.title = 'live player';
app.use("/node_modules", express.static(__dirname + '/node_modules'));
app.use("/", express.static(__dirname + '/view'));
//app.use(favicon(__dirname + '/public/images/logo.png'));
//app.use(morgan('dev'));

app.use(require('cors')());

//app.use('/api/player', require('./server/api/player'));

var server = http.createServer(app);
process.on('uncaughtException', function (err) {
    console.log('uncaughtException ' + err);
    console.log('uncaughtException ' + err.stack);
});
server.listen(port, function () {
    console.log("Server successed to start");
    console.log('Server listen on port ' + port);
});