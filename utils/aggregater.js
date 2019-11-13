let getQueryResult = require('./query.js').getQueryResult;

function makeCHORALEQuery(semanticid, direction, option) {
  if (option) {
    // TODO
    // ex. DRIVER_ID, SENSOR_ID, LABEL etc.
  }

  let query = '';
  query += 'SELECT  COUNT(*) AS elapsedtime, ';
  query += '        SUM(e.LOST_ENERGY) AS lost, ';
  query += '        SUM(e.CONVERT_LOSS) AS convert_loss, ';
  query += '        SUM(e.ENERGY_BY_AIR_RESISTANCE) AS air_loss, ';
  query += '        SUM(e.ENERGY_BY_ROLLING_RESISTANCE) AS rolling_loss, ';
  query += '        SUM(ABS(e.REGENE_LOSS)) AS regene_loss, ';
  query += '        SUM(ABS(e.REGENE_ENERGY)) AS regene_energy, ';
  query += '        DATEPART(hour, MIN(t.START_TIME)) AS start_hour ';
  query += 'FROM    ECOLOG_Doppler AS e ';
  query += '  INNER JOIN SEMANTIC_LINKS AS sl ON e.LINK_ID = sl.LINK_ID ';
  query += '  INNER JOIN TRIPS_Doppler AS t ON e.TRIP_ID = t.TRIP_ID ';
  query += 'WHERE   sl.SEMANTIC_LINK_ID = ' + semanticid + ' ';
  query += '  AND   t.TRIP_DIRECTION = \'' + direction + '\' ';
  query += '  AND   t.SENSOR_ID = (';
  query += '          SELECT  MAX(SENSOR_ID) ';
  query += '          FROM    TRIPS_Doppler AS it ';
  query += '          WHERE   t.TRIP_DIRECTION = it.TRIP_DIRECTION ';
  query += '            AND   CONVERT(VARCHAR(10), t.START_TIME, 111) = CONVERT(VARCHAR(10), it.START_TIME, 111) ';
  query += '            AND   t.DRIVER_ID = it.DRIVER_ID ';
  query += '        ) ';
  query += 'GROUP BY t.TRIP_ID ';

  return query;
}

exports.calcCHORALE = (semanticid, direction, option, callback) => {
  let queryStmt = makeCHORALEQuery(semanticid, direction, option);

  getQueryResult(queryStmt, (result) => {
    callback(result);
  });
}