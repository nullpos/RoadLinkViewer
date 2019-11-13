let Connection = require('tedious').Connection;
let Request = require('tedious').Request;
let config = require('./config.json');
let getQueryResult = require('./query.js').getQueryResult;


function makeEdgeQueryLegacy(latStart, lngStart, latEnd, lngEnd) {
  // make query to fetch vertices
  let latBetweenStmt = 'BETWEEN ' + parseFloat(latStart) + ' AND ' + parseFloat(latEnd);
  let lngBetweenStmt = 'BETWEEN ' + parseFloat(lngStart) + ' AND ' + parseFloat(lngEnd);

  let query = '';
  query += 'SELECT  LINKS1.LINK_ID AS LINKID, ';
  query += '        LINKS1.NUM AS NUM1, ';
  query += '        LINKS2.NUM AS NUM2, ';
  query += '        LINKS1.LATITUDE AS LATITUDE1, ';
  query += '        LINKS1.LONGITUDE AS LONGITUDE1, ';
  query += '        LINKS2.LATITUDE AS LATITUDE2, ';
  query += '        LINKS2.LONGITUDE AS LONGITUDE2, ';
  query += '        LINKS1.NODE_ID AS NODE1, ';
  query += '        LINKS2.NODE_ID AS NODE2 ';
  query += 'FROM LINKS AS LINKS1 ';
  query += '  INNER JOIN LINKS AS LINKS2 ON LINKS1.LINK_ID = LINKS2.LINK_ID ';
  query += 'WHERE   LINKS1.NUM - LINKS2.NUM = 1 ';
  query += '  AND   LINKS1.NUM > LINKS2.NUM ';
  query += '  AND   LINKS1.LATITUDE ' + latBetweenStmt + ' ';
  query += '  AND   LINKS1.LONGITUDE ' + lngBetweenStmt + ' ';

  return query;
}

function makeLineStringQueryLegacy(latStart, lngStart, latEnd, lngEnd) {
  // make query to draw polyline.
  // make query to fetch vertices
  let latBetweenStmt = 'BETWEEN ' + parseFloat(latStart) + ' AND ' + parseFloat(latEnd);
  let lngBetweenStmt = 'BETWEEN ' + parseFloat(lngStart) + ' AND ' + parseFloat(lngEnd);

  let query = '';
  query += 'SELECT  LINK_ID, ';
  query += '        NUM, ';
  query += '        LATITUDE, ';
  query += '        LONGITUDE ';
  query += 'FROM    LINKS ';
  query += 'WHERE   LINK_ID IN ( ';
  query += '          SELECT  DISTINCT LINK_ID ';
  query += '          FROM    LINKS ';
  query += '          WHERE   LATITUDE ' + latBetweenStmt + ' ';
  query += '            AND   LONGITUDE ' + lngBetweenStmt + ' ';
  query += '        )';
  query += 'ORDER BY LINK_ID, NUM';
  return query;
}

function makeLineStringQuery2019(latStart, lngStart, latEnd, lngEnd) {
  // make query to draw polyline.
  // make query to fetch vertices
  let latBetweenStmt = 'BETWEEN ' + parseFloat(latStart) + ' AND ' + parseFloat(latEnd);
  let lngBetweenStmt = 'BETWEEN ' + parseFloat(lngStart) + ' AND ' + parseFloat(lngEnd);

  let query = '';
  query += 'SELECT  LINK_ID, ';
  query += '        NUM, ';
  query += '        LATITUDE, ';
  query += '        LONGITUDE ';
  query += 'FROM    LINKS_GSI20 ';
  query += 'WHERE   LINK_ID IN ( ';
  query += '          SELECT  DISTINCT LINK_ID ';
  query += '          FROM    LINKS_GSI20 ';
  query += '          WHERE   LATITUDE ' + latBetweenStmt + ' ';
  query += '            AND   LONGITUDE ' + lngBetweenStmt + ' ';
  query += '        )';
  query += 'ORDER BY LINK_ID, NUM';
  return query;
}

function makeLineStringQueryOtherGSI(latStart, lngStart, latEnd, lngEnd) {
  // make query to draw polyline.
  // make query to fetch vertices
  let latBetweenStmt = 'BETWEEN ' + parseFloat(latStart) + ' AND ' + parseFloat(latEnd);
  let lngBetweenStmt = 'BETWEEN ' + parseFloat(lngStart) + ' AND ' + parseFloat(lngEnd);

  let query = '';
  query += 'SELECT  LINK_ID, ';
  query += '        NUM, ';
  query += '        LATITUDE, ';
  query += '        LONGITUDE ';
  query += 'FROM    LINKS_GSI20_Other ';
  query += 'WHERE   LINK_ID IN ( ';
  query += '          SELECT  DISTINCT LINK_ID ';
  query += '          FROM    LINKS_GSI20_Other ';
  query += '          WHERE   LATITUDE ' + latBetweenStmt + ' ';
  query += '            AND   LONGITUDE ' + lngBetweenStmt + ' ';
  query += '        )';
  query += 'ORDER BY LINK_ID, NUM';
  return query;
}

function makeLinkFetchQueryGSI20(latStart, lngStart, latEnd, lngEnd) {
  // make query to get link.

  let query = '';
  query += 'SELECT * ';
  query += 'FROM LINKS_GSI20 ';
  query += 'WHERE LATITUDE BETWEEN ' + parseFloat(latStart) + ' AND ' + parseFloat(latEnd) + ' ';
  query += '  AND LONGITUDE BETWEEN ' + parseFloat(lngStart) + ' AND ' + parseFloat(lngEnd) + ' ';
  // query += '  AND SCALE = 25000 ';
  return query;
}

function makeLinkEdgeFetchQueryGSI20(latStart, lngStart, latEnd, lngEnd) {
  let latBetweenStmt = 'BETWEEN ' + parseFloat(latStart) + ' AND ' + parseFloat(latEnd);
  let lngBetweenStmt = 'BETWEEN ' + parseFloat(lngStart) + ' AND ' + parseFloat(lngEnd);

  let query = '';
  query += 'SELECT  LINKS1.LINK_ID AS LINK_ID1, ';
  //query += '        LINKS2.LINK_ID AS LINK_ID2, ';
  query += '        LINKS1.NUM AS NUM1, ';
  query += '        LINKS2.NUM AS NUM2, ';
	query	+= '        LINKS1.LATITUDE AS LATITUDE1, ';
	query	+= '        LINKS1.LONGITUDE AS LONGITUDE1, ';
	query += '        LINKS2.LATITUDE AS LATITUDE2, ';
  query += '        LINKS2.LONGITUDE AS LONGITUDE2, ';
  query += '        LINKS1.SCALE AS SCALE, ';
  query += '        LINKS1.NODE AS NODE1, ';
  query += '        LINKS2.NODE AS NODE2 ';
  query += 'FROM    LINKS_GSI20 AS LINKS1 ';
  query += '  INNER JOIN LINKS_GSI20 AS LINKS2 ON LINKS1.LINK_ID = LINKS2.LINK_ID ';
  query += 'WHERE   LINKS1.NUM - LINKS2.NUM = 1 ';
  query += '  AND   LINKS1.NUM > LINKS2.NUM  ';
  query += '  AND   LINKS1.SCALE = LINKS2.SCALE ';
  query += '  AND   LINKS1.LATITUDE ' + latBetweenStmt + ' ';
  query += '  AND   LINKS1.LONGITUDE ' + lngBetweenStmt + ' ';
  // query += '  AND   LINKS1.SCALE = 25000 '
  // console.log(query);
  return query;
}

function makeLinkFetchQueryOtherGSI(latStart, lngStart, latEnd, lngEnd) {
  // make query to get link.

  let query = '';
  query += 'SELECT * ';
  query += 'FROM LINKS_GSI20_Other ';
  query += 'WHERE LATITUDE BETWEEN ' + parseFloat(latStart) + ' AND ' + parseFloat(latEnd) + ' ';
  query += '  AND LONGITUDE BETWEEN ' + parseFloat(lngStart) + ' AND ' + parseFloat(lngEnd) + ' ';
  // query += '  AND SCALE = 25000 ';
  return query;
}

function makeLinkEdgeFetchQueryOtherGSI(latStart, lngStart, latEnd, lngEnd) {
  let latBetweenStmt = 'BETWEEN ' + parseFloat(latStart) + ' AND ' + parseFloat(latEnd);
  let lngBetweenStmt = 'BETWEEN ' + parseFloat(lngStart) + ' AND ' + parseFloat(lngEnd);

  let query = '';
  query += 'SELECT  LINKS1.LINK_ID AS LINK_ID1, ';
  //query += '        LINKS2.LINK_ID AS LINK_ID2, ';
  query += '        LINKS1.NUM AS NUM1, ';
  query += '        LINKS2.NUM AS NUM2, ';
  query += '        LINKS1.LATITUDE AS LATITUDE1, ';
  query += '        LINKS1.LONGITUDE AS LONGITUDE1, ';
  query += '        LINKS2.LATITUDE AS LATITUDE2, ';
  query += '        LINKS2.LONGITUDE AS LONGITUDE2, ';
  query += '        LINKS1.SCALE AS SCALE, ';
  query += '        LINKS1.NODE AS NODE1, ';
  query += '        LINKS2.NODE AS NODE2 ';
  query += 'FROM    LINKS_GSI20_Other AS LINKS1 ';
  query += '  INNER JOIN LINKS_GSI20_Other AS LINKS2 ON LINKS1.LINK_ID = LINKS2.LINK_ID ';
  query += 'WHERE   LINKS1.NUM - LINKS2.NUM = 1 ';
  query += '  AND   LINKS1.NUM > LINKS2.NUM  ';
  query += '  AND   LINKS1.SCALE = LINKS2.SCALE ';
  query += '  AND   LINKS1.LATITUDE ' + latBetweenStmt + ' ';
  query += '  AND   LINKS1.LONGITUDE ' + lngBetweenStmt + ' ';
  // query += '  AND   LINKS1.SCALE = 25000 '
  // console.log(query);
  return query;
}

function makeSemanticViewQuery(latStart, lngStart, latEnd, lngEnd, semanticId) {
  let latBetweenStmt = 'BETWEEN ' + parseFloat(latStart) + ' AND ' + parseFloat(latEnd);
  let lngBetweenStmt = 'BETWEEN ' + parseFloat(lngStart) + ' AND ' + parseFloat(lngEnd);

  let query = '';
  query += 'SELECT  LINK_ID, ';
  query += '        NUM, ';
  query += '        LATITUDE, ';
  query += '        LONGITUDE, ';
  query += '        (SELECT  CASE COUNT(1) ';
  query += '                    WHEN 0 THEN 0 ';
  query += '                    ELSE 1 END ';
  query += '        FROM     SEMANTIC_LINKS ';
  query += '        WHERE    l.LINK_ID = SEMANTIC_LINKS.LINK_ID ';
  query += '          AND    SEMANTIC_LINK_ID = ' + semanticId + ' ';
  query += '        ) AS IS_SEMANTICS ';
  query += 'FROM    LINKS AS l ';
  query += 'WHERE   LINK_ID IN ( ';
  query += '          SELECT  DISTINCT LINK_ID ';
  query += '          FROM    LINKS ';
  query += '          WHERE   (LATITUDE ' + latBetweenStmt + ' AND LONGITUDE ' + lngBetweenStmt + ') ';
  query += '            OR    (LINK_ID IN (SELECT LINK_ID FROM SEMANTIC_LINKS WHERE SEMANTIC_LINK_ID = ' + semanticId + ')) ';
  query += '        ) ';
  query += 'ORDER BY LINK_ID, NUM';
  return query;
}

/**
 * This function nake query to fetch specified semantic's nodes.
 * @param {*} semanticid 
 */
function makeSemanticLinksFetchQuery (semanticid) {
  let query = '';
  query += 'SELECT  LINK_ID, ';
  query += '        NUM, ';
  query += '        LATITUDE, ';
  query += '        LONGITUDE ';
  query += 'FROM    LINKS AS l ';
  query += 'WHERE   LINK_ID IN (';
  query += '          SELECT  DISTINCT LINK_ID ';
  query += '          FROM    SEMANTIC_LINKS  ';
  query += '          WHERE   SEMANTIC_LINK_ID = ' + semanticid + ') ';
  query += 'ORDER BY LINK_ID, NUM';

  return query;
}

function makeLineStringGeoJson(orderedLinks) {
  let response = {};
  response.type = 'FeatureCollection';
  response.features = [];

  let currentLinkId = null;
  let feature = {};
  let count = 0;

  orderedLinks.forEach(function(record) {
    if (currentLinkId !== record.LINK_ID) {
      if (currentLinkId) {
        // push current lineString.
        feature.properties.count = count;
        response.features.push(feature);
      }
      // change link.
      currentLinkId = record.LINK_ID;
      
      feature = {};
      feature.type = 'Feature';
      feature.geometry = {};
      feature.geometry.type = 'LineString';
      feature.geometry.coordinates = [];
      feature.properties = {};
      feature.properties.linkid = record.LINK_ID;
      count = 0;
    }

    feature.geometry.coordinates.push([record.LATITUDE, record.LONGITUDE]);
    count++;
  });

  if (feature) {
    // push last feature.
    feature.properties = {};
    feature.properties.linkid = currentLinkId;
    feature.properties.count = count;
    response.features.push(feature);
  }

  return response;
}

exports.fetchEdgeLegacy = function(latStart, lngStart, latEnd, lngEnd, callback) {
  let querystmt = makeEdgeQueryLegacy(latStart, lngStart, latEnd, lngEnd);

  getQueryResult(querystmt, function(result) {
    callback(result);
  });
}

exports.fetchLineString = function(latStart, lngStart, latEnd, lngEnd, callback) {
  let querystmt = makeLineStringQueryLegacy(latStart, lngStart, latEnd, lngEnd);

  getQueryResult(querystmt, function(result) {
    callback(makeLineStringGeoJson(result));
  })
}

exports.fetch2019LineString = function(latStart, lngStart, latEnd, lngEnd, callback) {
  let querystmt = makeLineStringQuery2019(latStart, lngStart, latEnd, lngEnd);

  getQueryResult(querystmt, function(result) {
    callback(makeLineStringGeoJson(result));
  })
}

exports.fetchOtherGSILineString = function(latStart, lngStart, latEnd, lngEnd, callback) {
  let querystmt = makeLineStringQueryOtherGSI(latStart, lngStart, latEnd, lngEnd);

  getQueryResult(querystmt, function(result) {
    callback(makeLineStringGeoJson(result));
  })
}

exports.fetchLineStringSemanticAndRectangle = (latStart, lngStart, latEnd, lngEnd, semanticId, callback) => {
  let querystmt = makeSemanticViewQuery(latStart, lngStart, latEnd, lngEnd, semanticId);

  getQueryResult(querystmt, function(orderedLinks) {
    let response = {};
    response.type = 'FeatureCollection';
    response.features = [];
  
    let currentLinkId = null;
    let feature = {};
    let count = 0;
  
    orderedLinks.forEach(function(record) {
      if (currentLinkId !== record.LINK_ID) {
        if (currentLinkId) {
          // push current lineString.
          feature.properties.count = count;
          response.features.push(feature);
        }
        // change link.
        currentLinkId = record.LINK_ID;
        
        feature = {};
        feature.type = 'Feature';
        feature.geometry = {};
        feature.geometry.type = 'LineString';
        feature.geometry.coordinates = [];
        feature.properties = {};
        feature.properties.linkid = record.LINK_ID;
        feature.properties.issemantics = record.IS_SEMANTICS;
        count = 0;
      }
  
      feature.geometry.coordinates.push([record.LATITUDE, record.LONGITUDE]);
      count++;
    });
  
    if (feature) {
      // push last feature.
      feature.properties = {};
      feature.properties.linkid = currentLinkId;
      feature.properties.count = count;
      response.features.push(feature);
    }

    callback(response);
  })
}

exports.fetchLineStringSemantic = (semanticid, callback) => {
  let querystmt = makeSemanticLinksFetchQuery(semanticid);

  getQueryResult(querystmt, function(orderedLinks) {
    let response = {};
    response.type = 'FeatureCollection';
    response.features = [];

    let currentLinkId = null;
    let feature = {};
    let count = 0;

    orderedLinks.forEach(function(record) {
      if (currentLinkId !== record.LINK_ID) {
        if (currentLinkId) {
          // push current linestring.
          feature.properties.count = count;
          response.features.push(feature)
        }

        // change link.

        currentLinkId = record.LINK_ID;

        feature = {};
        feature.type = 'Feature';
        feature.geometry = {};
        feature.geometry.type = 'LineString';
        feature.geometry.coordinates = [];
        feature.properties = {};
        feature.properties.linkid = record.LINK_ID;
        count = 0;
      }

      feature.geometry.coordinates.push([record.LATITUDE, record.LONGITUDE]);
      count++;
    });

    if (feature) {
      // push last feature.
      feature.properties = {};
      feature.properties.linkid = currentLinkId;
      feature.properties.count = count;
      response.features.push(feature);
    }

    callback(response);
  })
}


exports.fetchLinksGSI20 = function(latStart, lngStart, latEnd, lngEnd, callback) {
  let querystmt = makeLinkFetchQueryGSI20(latStart, lngStart, latEnd, lngEnd);

  getQueryResult(querystmt, function(result) {
    callback(result);
  });
}

exports.fetchLinksEdgeGSI20 = function(latStart, lngStart, latEnd, lngEnd, callback) {
  let querystmt = makeLinkEdgeFetchQueryGSI20(latStart, lngStart, latEnd, lngEnd);

  getQueryResult(querystmt, function(result) {
    callback(result);
  });
}


exports.fetchLinksOtherGSI = function(latStart, lngStart, latEnd, lngEnd, callback) {
  let querystmt = makeLinkFetchQueryOtherGSI(latStart, lngStart, latEnd, lngEnd);

  getQueryResult(querystmt, function(result) {
    callback(result);
  });
}

exports.fetchLinksEdgeOtherGSI = function(latStart, lngStart, latEnd, lngEnd, callback) {
  let querystmt = makeLinkEdgeFetchQueryOtherGSI(latStart, lngStart, latEnd, lngEnd);

  getQueryResult(querystmt, function(result) {
    callback(result);
  });
}