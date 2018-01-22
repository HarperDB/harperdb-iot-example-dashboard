const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const data_hander = require('./data_handler.js');
const http = require('http');
const request = require("request");
const index = require('./routes/index');
const terms = require('./common_terms.js');

let app = express();

const SQL_OPERATION = 'sql';
const VIEWS_DIR = 'views';
const PUBLIC_DIR = 'public';
const VIEW_ENGINE = 'jade';
const DEV_ENVIRONMENT_NAME = 'development';
const ENV_VAR_NAME = 'env';

// view engine setup
app.set('views', path.join(__dirname, VIEWS_DIR));
app.set('view engine', VIEW_ENGINE);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, PUBLIC_DIR)));
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get(ENV_VAR_NAME) === DEV_ENVIRONMENT_NAME ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

let httpServer = http.createServer(app);
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
    if(socket.client.conn.readyState === 'open'){
        let options = {
            method: terms.POST_METHOD,
            url: terms.HARPER_URL,
            headers:
                {
                    authorization: terms.AUTH_TOKEN,
                    'content-type': terms.CONTENT_HEADER
                },
            body:
                {
                    operation: SQL_OPERATION,
                    sql: 'select count(timetoken) as records, max(radiation_level), median(humidity), avg(ambient_temperature)  from iot_data.message'
                },
            json: true };

        request(options, function (error, response, body) {
            if (error) {
                console.error(error);
            }
            socket.emit(terms.SOCKET_QUERY_MESSAGE_NAME, body);
            setTimeout(function(){ queryHarperDB(socket); }, 5000);

        });
    }

}


io.on('connection', onConnection);

// we connect to this via ./public/index.js
socket_http.listen(8080, () => console.log('socket server on'));
module.exports = app;
