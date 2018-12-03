// This file contains function to query to DB.  

// Library to connect DB
let Connection = require('tedious').Connection;
let Request = require('tedious').Request;

// Configure file to connect DB.
let config = require('./config.json');

exports.getQueryResult = function(queryStatement, callback) {
  let connection = new Connection(config);
  
  let result = Array();

  connection.on('connect', function(err) {
    if (err) {
      console.log(err);  
      return;
    }

    request = new Request(queryStatement, function(err, rowCount) {
      if (err) {
        console.log(err);
      }
      connection.close();
      callback(result);
    });

    request.on('row', function(columns) {
      let record = new Object();

      columns.forEach(function (column) {
        let colName = column.metadata.colName;
        let value = column.value;

        record[colName] = value;
      });

      result.push(record);
    });

    connection.execSql(request);
  });
}