var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let linkFetcher = require('./utils/linkFetcher.js');
let semantics = require('./utils/semantic.js');

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
    title: 'RoadLinkViewerIndexPage!'
  })
})

app.get('/legacy', function(req, res) {
  res.render('legacy', {
    title: 'LegacyRoadLinkViewer'
  });
});

app.get('/gsi20', function(req, res) {
  res.render('gsi20', {
    title: 'GSI20Viewer'
  });
});

app.get('/legacylinestring', function(req, res) {
  res.render('legacylinestring', {
    title: 'LegacyLineStrings'
  });
});

app.get('/legacysemantic', (req, res) => {
  res.render('legacysemantic', {
    title: 'Semantic Editor'
  });
})

app.get('/json/legacy/edge/', function(req, res) {
  linkFetcher.fetchEdgeLegacy(req.query.latstart,
                              req.query.lngstart,
                              req.query.latend,
                              req.query.lngend,
                              function(ret) {
                                res.json(ret);
                              });
});

app.get('/json/gsi20/links/vertex/', function(req, res) {
  console.log(req.query.latstart + ',' + req.query.lngstart + ',' + req.query.latend + ',' + req.query.lngend);
  linkFetcher.fetchLinksGSI20(req.query.latstart, 
                              req.query.lngstart, 
                              req.query.latend, 
                              req.query.lngend, 
                              function(ret) {
                                res.json(ret);
                              });
})

app.get('/json/gsi20/links/edge/', function(req, res) {
  linkFetcher.fetchLinksEdgeGSI20(req.query.latstart, 
                              req.query.lngstart, 
                              req.query.latend, 
                              req.query.lngend, 
                              function(ret) {
                                res.json(ret);
                              });
})

app.get('/json/legacy/linestring/', function(req, res) {
  linkFetcher.fetchLineString(req.query.latstart,
                              req.query.lngstart,
                              req.query.latend,
                              req.query.lngend,
                              function(ret) {
                                res.json(ret);
                              });
})

app.get('/json/legacy/semanticlist', (req, res) => {
  semantics.fetchSemanticList((ret) => {
    res.json(ret);
  });
});

// sample: /json/legacy/semantics/?latstart=35.3932102722828&lngstart=139.4594814052582&latend=35.401454674824315&lngend=139.47085840797428&semanticid=366
app.get('/json/legacy/semantics/', function(req, res) {
  let semanticid = req.query.semanticid;
  if(!semanticid) {
    // If semanticid not specified, only links in view will returns.
    semanticid = -1;
  }

  if (req.query.latstart && req.query.latend && req.query.lngstart && req.query.lngend) {
    linkFetcher.fetchLineStringSemanticAndRectangle(req.query.latstart,
                                                    req.query.lngstart,
                                                    req.query.latend,
                                                    req.query.lngend,
                                                    semanticid,
                                                    function(ret) {
                                                      res.json(ret);
                                                    });
  }
});

app.post('/methods/createsemantic', (req, res) => {
  let semanticId = req.body.semanticid;
  let driverId = req.body.driverid;
  let linkId = req.body.linkid;
  let semantic = req.body.semantic;

  if (semanticId && driverId && linkId && semantic) {
    semantics.createSemantics(semanticId, driverId, linkId, semantic, (status, result) => {
      res.status(status).send(result);
    });
  } else {
    console.log(semanticId);
    console.log(driverId);
    console.log(linkId);
    console.log(semantic);
    console.log(req.body);
    res.status(400).send(req.body);
  }
})

app.delete('/methods/deletesemantic', (req, res) => {
  res.status(200).send(req.query);
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
