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