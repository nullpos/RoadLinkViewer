var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let linkFetcher = require('./utils/linkFetcher.js');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

app.get('/', function(req, res) {
  res.render('index', {
    title: 'RoadLinkViewer'
  });
});

app.get('/json/links/', function(req, res) {
  console.log(req.query.latstart + ',' + req.query.lngstart + ',' + req.query.latend + ',' + req.query.lngend);
  linkFetcher.fetchLinksGSI20(req.query.latstart, 
                              req.query.lngstart, 
                              req.query.latend, 
                              req.query.lngend, 
                              function(ret) {
                                res.json(ret);
                              });
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
