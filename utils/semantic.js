let getQueryResult = require('./query.js').getQueryResult;

function makeSemanticListQuery() {
  // make semantic list.

  query = '';
  query += 'SELECT  DISTINCT SEMANTIC_LINK_ID, ';
  query += '        SEMANTICS, ';
  query += '        DRIVER_ID ';
  query += 'FROM    SEMANTIC_LINKS ';
  query += 'ORDER BY SEMANTIC_LINK_ID ';

  return query;
}

function makeCreateSemanticQuery(semanticId, dirverId, linkId, semantics) {
  // create semantics

  let query = '';
  query += 'INSERT INTO SEMANTIC_LINKS ';
  query += '(SEMANTIC_LINK_ID, DRIVER_ID, LINK_ID, SEMANTICS) '
  query += 'VALUES (' + semanticId + ', ' + dirverId + ', \'' + linkId + '\', \'' + semantics + '\') ';
  
  return query;
}

exports.fetchSemanticList = (callback) => {
  getQueryResult(makeSemanticListQuery(), (result) => {
    callback(result);
  });
}

exports.createSemantics = (semanticId, driverId, linkId, semantics, callback) => {
  getQueryResult(makeCreateSemanticQuery(semanticId, driverId, linkId, semantics), (result) => {
    console.log(result);
    callback(200, {'result': result});
  })
}