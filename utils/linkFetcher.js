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

exports.fetchEdgeLegacy = function(latStart, lngStart, latEnd, lngEnd, callback) {
  let querystmt = makeEdgeQueryLegacy(latStart, lngStart, latEnd, lngEnd);

  getQueryResult(querystmt, function(result) {
    callback(result);
  });
}

exports.fetchLineString = function(latStart, lngStart, latEnd, lngEnd, callback) {
  let querystmt = makeLineStringQueryLegacy(latStart, lngStart, latEnd, lngEnd);

  getQueryResult(querystmt, function(result) {

    let response = {};
    response.type = 'FeatureCollection';
    response.features = [];

    let currentLinkId = null;
    let feature = {};
    let count = 0;

    result.forEach(function(record) {
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