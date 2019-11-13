let getQueryResult = require('./query.js').getQueryResult;

function makePlaceListQuery() {
  const query = `
    SELECT PLACE_ID
      ,PLACE_NAME
      ,START_LATITUDE
      ,END_LATITUDE
      ,START_LONGITUDE
      ,END_LONGITUDE
      ,START_DATE
      ,END_DATE
      ,PROPERTY
    FROM PLACE
    ORDER BY PLACE_ID
  `
  return query;
}

exports.fetchPlaceList = (callback) => {
  getQueryResult(makePlaceListQuery(), (result) => {
    callback(result);
  });
}