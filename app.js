var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let linkFetcher = require('./utils/linkFetcher.js');
let semantics = require('./utils/semantic.js');
let aggregater = require('./utils/aggregater');
let place = require('./utils/place');
let getQueryResult = require('./utils/query.js').getQueryResult;

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

app.get('/2019linestring', function(req, res) {
  res.render('2019linestring', {
    title: '2019LineStrings'
  });
});

app.get('/legacysemantic', (req, res) => {
  res.render('legacysemantic', {
    title: 'Semantic Editor'
  });
});

app.get('/aggregatebysemantic', (req, res) => {
  res.render('aggregatebysemantic', {
    title: 'Aggregate By Semantic'
  });
});

app.get('/place', (req, res) => {
  res.render('place', {
    title: 'Place'
  });
});

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

app.get('/json/othergsi/links/vertex/', function(req, res) {
  console.log(req.query.latstart + ',' + req.query.lngstart + ',' + req.query.latend + ',' + req.query.lngend);
  linkFetcher.fetchLinksOtherGSI(req.query.latstart, 
                              req.query.lngstart, 
                              req.query.latend, 
                              req.query.lngend, 
                              function(ret) {
                                res.json(ret);
                              });
})

app.get('/json/othergsi/links/edge/', function(req, res) {
  linkFetcher.fetchLinksEdgeOtherGSI(req.query.latstart, 
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

app.get('/json/legacy/chorale', (req, res) => {
  if (!req.query.semanticid) {
    res.status(400).send({error: 'semantic id is needed.'});
  }

  if (!req.query.direction) {
    res.status(400).send({error: 'direction is needed'});
  }

  aggregater.calcCHORALE(req.query.semanticid, req.query.direction, req.query.option, (result) => {
    res.json(result);
  })
})

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
  } else if (semanticid != -1) {
    // fetch only semantic links.
    linkFetcher.fetchLineStringSemantic(semanticid, function(ret) {
      res.json(ret);
    })
  }
});

app.get('/json/2019/linestring/', function(req, res) {
  linkFetcher.fetch2019LineString(req.query.latstart,
                              req.query.lngstart,
                              req.query.latend,
                              req.query.lngend,
                              function(ret) {
                                res.json(ret);
                              });
})

app.get('/json/othergsi/linestring/', function(req, res) {
  linkFetcher.fetchOtherGSILineString(req.query.latstart,
                              req.query.lngstart,
                              req.query.latend,
                              req.query.lngend,
                              function(ret) {
                                res.json(ret);
                              });
})

app.get('/json/place/', function(req, res) {
  place.fetchPlaceList(function(ret) {
                        res.json(ret);
                      });
})

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
  let semanticId = req.query.semanticid;
  let linkId = req.query.linkid;
  if (semanticId && linkId) {
    semantics.deleteSemantics(semanticId, linkId, (status, result) => {
      res.status(status).send(result);
    });
  } else {
    res.status(400).send(req.query);
  }
})

app.get('/query', (req, res) => {
  let query = req.query.query;

  try {
    getQueryResult(query, (result) => {
      res.status(200).json(result);
    });
  } catch (e) {
    console.log('error occured.')
    res.status(400).send({query: query});
  }
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
