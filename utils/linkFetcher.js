let Connection = require('tedious').Connection;
let Request = require('tedious').Request;
let config = require('./config.json');

function makeLinkFetchQuery(latStart, lngStart, latEnd, lngEnd) {
  // make query to get link.

  let query = '';
  query += 'SELECT * ';
  query += 'FROM LINKS_GSI20 ';
  query += 'WHERE LATITUDE BETWEEN ' + parseFloat(latStart) + ' AND ' + parseFloat(latEnd) + ' ';
  query += '  AND LONGITUDE BETWEEN ' + parseFloat(lngStart) + ' AND ' + parseFloat(lngEnd) + ' ';
  
  return query;
}

function makeLinkEdgeFetchQuery(latStart, lngStart, latEnd, lngEnd) {

  let query = '';
  query += 'SELECT  LINKS1.LINK_ID AS LINK_ID, ';
	query += '        LINKS1.NUM AS CONSTITUTION_LINK_ID, ';
	query	+= '        LINKS1.LATITUDE AS LATITUDE1, ';
	query	+= '        LINKS1.LONGITUDE AS LONGITUDE1, ';
	query += '        LINKS2.LATITUDE AS LATITUDE2, ';
	query += '        LINKS2.LONGITUDE AS LONGITUDE2 ';
  query += 'FROM    LINKS_GSI20 AS LINKS1 ';
  query += '  INNER JOIN LINKS_GSI20 AS LINKS2 ON LINKS1.LINK_ID = LINKS2.LINK_ID ';
  query += 'WHERE   LINKS1.NUM - LINKS2.NUM = 1 ';
  query += '  AND   LINKS1.NUM > LINKS2.NUM  ';
  query += '  AND   LINKS1.LATITUDE BETWEEN ' + parseFloat(latStart) + ' AND ' + parseFloat(latEnd) + ' ';
  query += '  AND   LINKS1.LONGITUDE BETWEEN ' + parseFloat(lngStart) + ' AND ' + parseFloat(lngEnd) + ' ';
  // console.log(query);
  return query;
}

exports.fetchLinksGSI20 = function(latStart, lngStart, latEnd, lngEnd, callback) {
  let connection = new Connection(config);
  let links = new Array();

  connection.on('connect', function(err) {
    if (err) {
      console.log(err);
      return false;
    }

    request = new Request(makeLinkFetchQuery(latStart, lngStart, latEnd, lngEnd), function(err, rowCount) {
      if (err) {
        console.log(err);
      }

      connection.close();
      callback(links);
    });

    request.on('row', function (columns) {
      let record = new Object();

      columns.forEach(function (column) {
        record[column.metadata.colName] = column.value;
      });

      links.push(record);
    });

    connection.execSql(request);
  });
}

exports.fetchLinksEdgeGSI20 = function(latStart, lngStart, latEnd, lngEnd, callback) {
  let connection = new Connection(config);
  let links = new Array();

  connection.on('connect', function(err) {
    if (err) {
      console.log(err);
      return false;
    }

    request = new Request(makeLinkEdgeFetchQuery(latStart, lngStart, latEnd, lngEnd), function(err, rowCount) {
      if (err) {
        console.log(err);
      }

      connection.close();
      callback(links);
    });

    request.on('row', function (columns) {
      let record = new Object();

      columns.forEach(function (column) {
        record[column.metadata.colName] = column.value;
      });

      links.push(record);
    });

    connection.execSql(request);
  });
}