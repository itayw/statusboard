/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var sb = require('./lib/statusboard');

var app = express();

sb.init();


// all environments
app.set('port', sb.config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/ico/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/buildTable', routes.buildTable);
app.get('/targetDate', routes.targetDate);

app.post('/payload', routes.payload);

var server = http.createServer(app).listen(process.env.PORT || sb.config.port, function () {
  sb.io = require('socket.io').listen(server);
  console.log('Express server listening on port ' + sb.config.port);
});
