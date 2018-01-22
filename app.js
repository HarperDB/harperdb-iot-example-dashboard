var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var data_hander = require('./data_handler.js');
var http = require('http');
var request = require("request");
var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');

});

var httpServer = http.createServer(app);
httpServer.listen(61183, function () {
  console.log('server on');
});



const socket_http = require('http').Server(app);
const io = require('socket.io')(socket_http);



function onConnection(socket){
    // when the page is loaded lets start streaming data.
    data_hander.subscribe(socket);
    console.log('connected');
    queryHarperDB(socket);

}


function queryHarperDB(socket){
    var options = {
        method: 'POST',
        url: 'http://localhost:9925/',
        headers:
            {
                authorization: 'Basic SERCX0FETUlOOnBhc3N3b3Jk',
                'content-type': 'application/json'
            },
        body:
            {
                operation: 'sql',
                sql: 'select count(timetoken) as records, max(radiation_level), median(humidity), avg(ambient_temperature)  from iot_data.message'

            },
        json: true };

    request(options, function (error, response, body) {
        if (error) {
            console.error(error);

        }
        socket.emit('query-msg', body);
        setInterval(function(){queryHarperDB(socket)}, 5000);

    });
}


io.on('connection', onConnection);

// we connect to this via ./public/index.js
socket_http.listen(8080, () => console.log('socket server on'));





module.exports = app;
